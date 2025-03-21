const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer'); // Для обработки файлов
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка Multer для сохранения изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// В серверном коде добавьте проверку подключения
const db = new sqlite3.Database('blog.db', (err) => {
  if (err) {
    console.error('Ошибка подключения к БД:', err.message);
  } else {
    console.log('База данных подключена');
  }
});

// Создание таблиц
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      category TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER,
      status TEXT CHECK( status IN ('pending','approved','rejected') ) DEFAULT 'pending',
      rejection_reason TEXT,
      moderated_by INTEGER REFERENCES users(id),
      moderated_at DATETIME,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 часа
}));

app.options('*', cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
// Middleware для проверки авторизации
const authMiddleware = (req, res, next) => {
  let token = req.cookies.token || null;

  // Проверяем заголовок Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Токен не найден' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) {
      console.error('Ошибка верификации токена:', err.message);
      return res.status(403).json({ error: 'Невалидный токен' });
    }
    req.user = decoded;
    next();
  });
};

// Middleware для проверки прав администратора
const isAdminMiddleware = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  next();
};

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  console.log('Получен POST-запрос на /api/posts');
  console.log('Тело запроса:', req.body);
  console.log('Файл:', req.file);
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Заполните все поля' });
    }
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      return res.status(500).json({ message: 'Ошибка хеширования пароля' });
    }
    db.run(
      'INSERT INTO users (username, password, is_admin) VALUES (?, ?, 0)',
      [username, hashedPassword],
      (err) => {
        if (err) {
          console.error('Ошибка регистрации:', err.message);
          return res.status(400).json({ message: 'Пользователь уже существует' });
        }
        res.json({ message: 'Регистрация успешна' });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера: ' + error.message });
  }
});

// Вход пользователя
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Неверные данные' });
    }
    const token = jwt.sign(
      { id: user.id, isAdmin: user.is_admin },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 43200000, // 30m
      sameSite: 'lax',
      path: '/', // Кука доступна для всего домена
      secure: false // Для HTTP в dev-среде
    });
    res.json({ message: 'Успешный вход' });
  });
});

// Выход пользователя
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Успешный выход' });
});

// Получение профиля пользователя
app.get('/api/profile', authMiddleware, (req, res) => {
  db.get(
    'SELECT id, username, is_admin FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Ошибка сервера' });
      res.json(user);
    }
  );
});

// Админка - управление пользователями
app.get('/api/admin/users', authMiddleware, isAdminMiddleware, (req, res) => {
  db.all('SELECT id, username, is_admin FROM users', (err, users) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    res.json(users);
  });
});

app.put('/api/admin/users/:id', authMiddleware, isAdminMiddleware, (req, res) => {
  const { is_admin } = req.body;
  const userId = req.params.id;
  db.run('UPDATE users SET is_admin = ? WHERE id = ?', 
    [is_admin ? 1 : 0, userId],
    (err) => {
      if (err) return res.status(500).json({ error: 'Ошибка обновления' });
      res.json({ success: true });
    }
  );
});

app.delete('/api/admin/users/:id', authMiddleware, isAdminMiddleware, (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Ошибка удаления' });
    res.json({ success: true });
  });
});

// Админка - управление постами
app.get('/api/admin/posts', authMiddleware, isAdminMiddleware, (req, res) => {
  db.all(`
    SELECT posts.*, users.username 
    FROM posts 
    LEFT JOIN users ON posts.user_id = users.id
  `, (err, posts) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    res.json(posts);
  });
});
// Роут создания поста
app.post('/api/admin/posts', upload.single('image'), authMiddleware, isAdminMiddleware, (req, res) => {
  const { title, content, category } = req.body; // Добавлено category
  const userId = req.user.id;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    'INSERT INTO posts (title, content, category, image, user_id, status) VALUES (?, ?, ?, ?, ?, "approved")',
    [title, content, category, imagePath, userId],
    function (err) {
      if (err) {
        console.error('Ошибка создания поста:', err.message);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      // Получаем созданный пост с автором
      db.get(
        `SELECT posts.*, users.username 
         FROM posts 
         LEFT JOIN users ON posts.user_id = users.id 
         WHERE posts.id = ?`,
        [this.lastID],
        (err, post) => {
          if (err) {
            console.error('Ошибка получения поста:', err.message);
            return res.status(500).json({ error: 'Ошибка сервера' });
          }
          res.json(post);
        }
      );
    }
  );
});

// Роут для обновления поста с изображением
app.put('/api/admin/posts/:id', upload.single('image'), authMiddleware, isAdminMiddleware, (req, res) => {
  const { title, content, category } = req.body; // Добавлено category
  const postId = req.params.id;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  let query = 'UPDATE posts SET title = ?, content = ?, category = ?';
  const params = [title, content, category]; // Добавлено category

  if (imagePath) {
    query += ', image = ?';
    params.push(imagePath);
  }

  query += ' WHERE id = ?';
  params.push(postId);

  db.run(query, params, (err) => {
    if (err) {
      console.error('Ошибка обновления поста:', err.message);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    res.json({ success: true });
  });
});

app.delete('/api/admin/posts/:id', authMiddleware, isAdminMiddleware, (req, res) => {
  db.run('DELETE FROM posts WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Ошибка удаления' });
    res.json({ success: true });
  });
});


// роут для мероприятий
app.get('/api/events', (req, res) => {
  const { category, search, sort, page = 1, limit = 3 } = req.query;
  const offset = (page - 1) * limit;
  
  let sql = `
    SELECT 
      id,
      title,
      content AS description,
      image,
      category,
      created_at,
      status  -- Добавлено поле status
    FROM posts
    WHERE status = 'approved'  -- Фильтрация одобренных постов
  `;
  const params = [];
  
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (title LIKE ? OR content LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  switch (sort) {
    case 'newest':
      sql += ' ORDER BY created_at DESC';
      break;
    case 'oldest':
      sql += ' ORDER BY created_at ASC';
      break;
    case 'title_asc':
      sql += ' ORDER BY title ASC';
      break;
    case 'title_desc':
      sql += ' ORDER BY title DESC';
      break;
    default:
      sql += ' ORDER BY created_at DESC';
  }

  sql += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const countSql = `
      SELECT COUNT(*) AS total 
      FROM posts 
      WHERE status = 'approved'
      ${category ? ' AND category = ?' : ''}
      ${search ? ' AND (title LIKE ? OR content LIKE ?)' : ''}
    `;

    db.get(countSql, category ? [category] : search ? [`%${search}%`, `%${search}%`] : [], (err, countRow) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        events: rows,
        totalPages: Math.ceil(countRow.total / limit),
        currentPage: parseInt(page)
      });
    });
  });
});

app.get('/api/events/:id', (req, res) => {
  const sql = `
    SELECT 
      id,
      title,
      content AS description,
      image,
      category,
      created_at
    FROM posts 
    WHERE id = ?
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      console.error('Ошибка запроса:', err.message);
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    res.json(row);
  });
});


// Обновите маршрут /api/posts
// В app.post('/api/posts') добавьте authMiddleware
app.post('/api/posts', 
  upload.single('image'), 
  authMiddleware, // Теперь проверяем авторизацию
  (req, res) => {
    try {
      const { title, content, category } = req.body;
      const userId = req.user.id; // Теперь req.user существует
      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Заполните обязательные поля' });
      }

      db.run(`
        INSERT INTO posts 
          (title, content, category, image, user_id, status) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        title,
        content,
        category,
        imagePath,
        userId,
        req.user.isAdmin ? 'approved' : 'pending'
      ], function(err) {
        if (err) {
          console.error('Ошибка:', err.message);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }
        res.json({ success: true });
      });
    } catch (error) {
      res.status(500).json({ error: 'Критическая ошибка: ' + error.message });
    }
});

// Замените текущий роут на:
app.get('/api/posts/user/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT * FROM posts 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `;
  
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    // Всегда возвращаем массив
    res.json(rows || []);
  });
});

// Роут повторной отправки поста
app.put('/api/posts/:id/resubmit', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Проверяем принадлежность поста
    const post = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!post || post.user_id !== userId) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Обновляем статус на "pending"
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE posts SET status = "pending", rejection_reason = NULL WHERE id = ?',
        [postId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка:', error.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

const checkPostOwnership = (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user.id;

  db.get('SELECT user_id FROM posts WHERE id = ?', [postId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    if (!row || row.user_id !== userId) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    next();
  });
};

app.put('/api/posts/:id', 
  authMiddleware, 
  upload.single('image'), // Обязательно для обработки файлов
  async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
      const { title, content, category } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

      // Проверяем существование поста
      const existingPost = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM posts WHERE id = ? AND user_id = ?', 
          [postId, userId],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          });
      });

      if (!existingPost) {
        return res.status(404).json({ error: 'Пост не найден' });
      }

      // Обновляем пост
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE posts 
          SET title = ?,
              content = ?,
              category = ?,
              image = ?
          WHERE id = ? AND user_id = ?
        `, [
          title || existingPost.title,
          content || existingPost.content,
          category || existingPost.category,
          image || existingPost.image,
          postId,
          userId
        ], (err) => {
          if (err) reject(err);
          resolve();
        });
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Ошибка:', error.message);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/moderation/pending', authMiddleware, (req, res) => {
  // Проверка роли модератора/админа
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }

  const sql = `
    SELECT posts.*, users.username 
    FROM posts 
    LEFT JOIN users ON posts.user_id = users.id
    WHERE posts.status = 'pending'
    ORDER BY posts.created_at DESC
  `;
  
  db.all(sql, (err, posts) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    res.json(posts);
  });
});

app.get('/api/posts/:id', authMiddleware, checkPostOwnership, (req, res) => {
  const postId = req.params.id;
  db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    if (!post) return res.status(404).json({ error: 'Пост не найден' });
    res.json(post);
  });
});

// Маршрут для одобрения поста
app.post('/api/moderation/approve/:id', authMiddleware, isAdminMiddleware, (req, res) => {
  const postId = req.params.id;
  const moderatorId = req.user.id;
  
  db.run(`
    UPDATE posts 
    SET status = 'approved',
        moderated_by = ?,
        moderated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [moderatorId, postId], (err) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    res.json({ success: true });
  });
});

// Маршрут для отклонения поста
app.post('/api/moderation/reject/:id', authMiddleware, isAdminMiddleware, (req, res) => {
  const postId = req.params.id;
  const { rejectionReason } = req.body;
  const moderatorId = req.user.id;
  
  db.run(`
    UPDATE posts 
    SET status = 'rejected',
        rejection_reason = ?,
        moderated_by = ?,
        moderated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [rejectionReason, moderatorId, postId], (err) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    res.json({ success: true });
  });
});

app.get('/api/moderation/posts/:id', authMiddleware, (req, res) => {
  db.get(`
    SELECT * FROM posts 
    WHERE id = ?
  `, [req.params.id], (err, post) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    if (!post) return res.status(404).json({ error: 'Пост не найден' });
    res.json(post);
  });
});

// Роут для обновления поста модератором
app.patch('/api/moderation/posts/:id', 
  upload.single('image'), // Для обработки файлов
  authMiddleware, 
  isAdminMiddleware, 
  (req, res) => {
    const { title, content, category } = req.body;
    const postId = req.params.id;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.image;

    db.run(`
      UPDATE posts 
      SET title = ?,
          content = ?,
          category = ?,
          image = ?
      WHERE id = ?
    `, [title, content, category, imagePath, postId], (err) => {
      if (err) return res.status(500).json({ error: 'Ошибка обновления' });
      res.json({ success: true });
    });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});