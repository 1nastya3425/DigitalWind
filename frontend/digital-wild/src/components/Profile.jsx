import { useEffect, useState } from 'react';
import { useAuth } from './authContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';
import EDUCATION_OPTIONS from '../const/educationOptions';

const Profile = () => {
  const { user, isLoading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [birthDate, setBirthDate] = useState(user?.date_of_birth || '');
  const [educationPlace, setEducationPlace] = useState(user?.place_of_study || '');
  const [customEducation, setCustomEducation] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  const handleSaveProfile = async () => {
    try {
      let finalEducation = educationPlace;
      if (educationPlace === 'other') {
        finalEducation = customEducation;
      }

      const response = await axios.put('http://localhost:3000/api/profile', {
        fullName,
        dateOfBirth: birthDate,
        placeOfStudy: finalEducation
      }, {
        withCredentials: true
      });
      
      updateUser(response.data);
      setIsEditing(false);
      setSuccessMessage('Профиль успешно обновлен');
    } catch (error) {
      setErrorMessage(`Ошибка: ${error.response?.data?.error || error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-card">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-section">
        <h3>Личный Кабинет</h3>
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <img src={user?.avatarUrl || '/default-avatar.png'} alt="Avatar" />
            <div className="profile-name">{user?.full_name || user?.username}</div>
          </div>
          <nav>
            <ul>
              <div className='sidebar-option'>
                <li>
                  <a href="/account" className='active-link'>Аккаунт</a>
                </li>
                <li>
                  <a href="/projects">Мои проекты</a>
                </li>
                <li>
                  <a href="/create-post">Создать пост</a>
                </li>
              </div>
              <li>
                <button onClick={logout} className='logout-acc'>Выйти...</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="content-container">
        <h3>Аккаунт</h3>
        <div className="account-info">
          {isEditing ? (
            <>
              <div className="form-group">
                <label>ФИО:</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Дата рождения:</label>
                <input 
                  type="date" 
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Место обучения:</label>
                <select 
                  value={educationPlace}
                  onChange={(e) => {
                    setEducationPlace(e.target.value);
                  }}
                  className="form-control"
                >
                  <option value="">Выберите вариант</option>
                  {EDUCATION_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {educationPlace === 'other' && (
                <div className="form-group">
                  <label>Укажите ваше учебное заведение:</label>
                  <input 
                    type="text"
                    value={customEducation}
                    onChange={(e) => {
                      setCustomEducation(e.target.value);
                      setEducationPlace(e.target.value);
                    }}
                    className="form-control"
                  />
                </div>
              )}
              <div className="button-group">
                <button 
                  onClick={handleSaveProfile} 
                  className="save-button"
                >
                  Сохранить
                </button>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="cancel-button"
                >
                  Отмена
                </button>
              </div>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              {successMessage && <p className="success-message">{successMessage}</p>}
            </>
          ) : (
            <>
              <p><strong>ФИО:</strong> {user.full_name || 'Не указано'}</p>
              <p><strong>Дата рождения:</strong> {user.date_of_birth || 'Не указана'}</p>
              <p><strong>Место обучения:</strong> {user.place_of_study || 'Не указано'}</p>
              <button 
                onClick={() => setIsEditing(true)} 
                className="edit-button"
              >
                Редактировать
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;