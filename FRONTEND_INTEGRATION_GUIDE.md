# 🚀 Frontend Entegrasyon Rehberi - YAP Nest Backend

## 📋 İçindekiler
- [API Bilgileri](#api-bilgileri)
- [Authentication](#authentication)
- [Endpoint'ler](#endpointler)
- [Data Models](#data-models)
- [Örnek Kodlar](#örnek-kodlar)
- [Hata Yönetimi](#hata-yönetimi)
- [Test Kullanıcısı](#test-kullanıcısı)

---

## 🌐 API Bilgileri

### **Development (Local)**
```
Base URL: http://localhost:3001
Swagger UI: http://localhost:3001/api
```

### **Production (Canlı)**
```
Base URL: https://yap-nest-ln0v4e3dr-berkans-projects-d2fa45cc.vercel.app
```

---

## 🔐 Authentication

### **Authentication Type**
- **JWT Bearer Token** kullanılıyor
- Tüm protected endpoint'ler için `Authorization: Bearer <token>` header'ı gerekli

### **Token Yönetimi**
```javascript
// Login sonrası token'ı localStorage'a kaydet
localStorage.setItem('token', response.data.token);

// API isteklerinde token'ı kullan
const token = localStorage.getItem('token');
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 📡 Endpoint'ler

### **1. Health Check**
```http
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-05T16:46:00.591Z"
}
```

### **2. Authentication Endpoints**

#### **Register**
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Kullanıcı Adı",
  "email": "email@example.com",
  "password": "şifre123",
  "role": "member",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### **Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "email@example.com",
  "password": "şifre123",
  "rememberMe": false
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "Kullanıcı Adı",
    "email": "email@example.com",
    "avatar": null,
    "role": "admin",
    "isActive": true,
    "createdAt": "2025-08-04T23:17:27.218Z",
    "updatedAt": "2025-08-04T23:17:27.218Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

#### **Profile**
```http
GET /auth/profile
Authorization: Bearer <token>
```

#### **Logout**
```http
POST /auth/logout
Authorization: Bearer <token>
```

#### **Password Reset**
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "email@example.com"
}
```

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "newPassword": "yeni-şifre123"
}
```

### **3. Projects Endpoints**

#### **Get All Projects**
```http
GET /projects
Authorization: Bearer <token>
```

#### **Create Project**
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Proje Adı",
  "description": "Proje açıklaması",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "budget": 50000,
  "progress": 0
}
```

#### **Get Project by ID**
```http
GET /projects/:id
Authorization: Bearer <token>
```

#### **Update Project**
```http
PATCH /projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Güncellenmiş Proje Adı",
  "status": "active",
  "progress": 50
}
```

#### **Delete Project**
```http
DELETE /projects/:id
Authorization: Bearer <token>
```

#### **Project Statistics**
```http
GET /projects/stats
Authorization: Bearer <token>
```

### **4. Tasks Endpoints**

#### **Get All Tasks**
```http
GET /tasks
Authorization: Bearer <token>
```

#### **Get Tasks by Project**
```http
GET /tasks?projectId=:projectId
Authorization: Bearer <token>
```

#### **Create Task**
```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Görev Adı",
  "description": "Görev açıklaması",
  "projectId": "project-uuid",
  "assigneeId": "user-uuid",
  "priority": "high",
  "dueDate": "2025-02-15",
  "estimatedHours": 16,
  "tags": ["frontend", "react"]
}
```

#### **Update Task**
```http
PATCH /tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress",
  "actualHours": 8
}
```

#### **Task Statistics**
```http
GET /tasks/stats
Authorization: Bearer <token>
```

### **5. Comments Endpoints**

#### **Get Comments**
```http
GET /comments
Authorization: Bearer <token>
```

#### **Get Comments by Project/Task**
```http
GET /comments?projectId=:projectId
GET /comments?taskId=:taskId
Authorization: Bearer <token>
```

#### **Create Comment**
```http
POST /comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Yorum metni",
  "type": "task",
  "taskId": "task-uuid"
}
```

---

## 📊 Data Models

### **User Model**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### **Project Model**
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  budget: number;
  progress: number;
  ownerId: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
}
```

### **Task Model**
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId: string;
  assignee: User;
  projectId: string;
  project: Project;
  dueDate?: string;
  estimatedHours: number;
  actualHours: number;
  parentTaskId?: string;
  parentTask?: Task;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### **Comment Model**
```typescript
interface Comment {
  id: string;
  content: string;
  type: 'task' | 'project' | 'general';
  authorId: string;
  author: User;
  taskId?: string;
  task?: Task;
  projectId?: string;
  project?: Project;
  parentCommentId?: string;
  parentComment?: Comment;
  createdAt: string;
  updatedAt: string;
}
```

---

## 💻 Örnek Kodlar

### **React/JavaScript API Service**

```javascript
// api.js
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:3001'; // Development
    // this.baseURL = 'https://yap-nest-ln0v4e3dr-berkans-projects-d2fa45cc.vercel.app'; // Production
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API Error');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Projects
  async getProjects() {
    return this.request('/projects');
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(projectData)
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // Tasks
  async getTasks(projectId = null) {
    const endpoint = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
    return this.request(endpoint);
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(taskData)
    });
  }

  // Comments
  async getComments(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/comments?${params}`);
  }

  async createComment(commentData) {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData)
    });
  }
}

export const apiService = new ApiService();
```

### **React Hook Örneği**

```javascript
// useAuth.js
import { useState, useEffect } from 'react';
import { apiService } from './api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await apiService.getProfile();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await apiService.login(email, password);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, loading, login, logout, checkAuth };
};
```

### **React Component Örneği**

```jsx
// ProjectList.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from './api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await apiService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const newProject = await apiService.createProject(projectData);
      setProjects([...projects, newProject]);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Projects</h2>
      {projects.map(project => (
        <div key={project.id}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <span>Status: {project.status}</span>
          <span>Progress: {project.progress}%</span>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
```

---

## ⚠️ Hata Yönetimi

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### **Error Response Format**
```json
{
  "statusCode": 400,
  "timestamp": "2025-08-05T16:46:00.591Z",
  "path": "/auth/login",
  "message": "Invalid credentials",
  "error": "Bad Request"
}
```

### **Hata Yönetimi Örneği**
```javascript
try {
  const response = await apiService.login(email, password);
  // Başarılı
} catch (error) {
  if (error.message.includes('Invalid credentials')) {
    // Kullanıcıya hatalı şifre mesajı göster
  } else if (error.message.includes('User not found')) {
    // Kullanıcıya kullanıcı bulunamadı mesajı göster
  } else {
    // Genel hata mesajı
  }
}
```

---

## 🧪 Test Kullanıcısı

### **Test Credentials**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### **Test Kullanıcısı Özellikleri**
- **Role:** admin
- **Status:** active
- **Permissions:** Tüm endpoint'lere erişim

---

## 🔧 CORS Ayarları

Backend'de CORS ayarları yapıldı:
- `http://localhost:3000` (React default)
- `http://localhost:3001`
- `https://*.vercel.app`
- `https://*.netlify.app`

---

## 📱 Frontend Framework Önerileri

### **React + Axios**
```bash
npm install axios
```

### **Vue.js + Axios**
```bash
npm install axios
```

### **Angular + HttpClient**
```bash
ng add @angular/common
```

---

## 🚀 Deployment

### **Development**
```bash
# Backend'i başlat
npm run start:dev

# Frontend'i başlat (React örneği)
npm start
```

### **Production**
- Backend: Vercel'de deploy edildi
- Frontend: Netlify, Vercel, veya tercih ettiğiniz platform

---

## 📞 Destek

### **Swagger UI**
- **Local:** http://localhost:3001/api
- **Production:** https://yap-nest-ln0v4e3dr-berkans-projects-d2fa45cc.vercel.app/api

### **API Documentation**
- Detaylı endpoint dokümantasyonu
- Request/Response örnekleri
- Test edebilirsiniz

---

## ✅ Checklist

- [ ] API base URL'leri ayarlandı
- [ ] Authentication token yönetimi
- [ ] Error handling
- [ ] Loading states
- [ ] Form validation
- [ ] CORS ayarları
- [ ] Test kullanıcısı ile test edildi

---

**🎉 Frontend entegrasyonu için her şey hazır!** 