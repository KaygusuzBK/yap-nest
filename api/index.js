const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://*.vercel.app'],
  credentials: true
}));
app.use(express.json());

// In-memory storage (Vercel serverless için)
let users = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2b$10$NB.Xcw1p3Q3or6RcQW3AOeTl8Cj1H8CK93u7vv5Yc5D2DMzWKBHUi', // password123
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let projects = [];
let tasks = [];

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API is running'
  });
});

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'member' } = req.body;

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists',
        error: 'Conflict',
        statusCode: 409
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);

    // Generate token
    const token = jwt.sign(
      { sub: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      user: userWithoutPassword,
      token,
      tokenType: 'Bearer',
      expiresIn: 3600
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: 401
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        message: 'Account is deactivated',
        error: 'Unauthorized',
        statusCode: 401
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: 401
      });
    }

    // Generate token
    const expiresIn = rememberMe ? 604800 : 3600; // 7 days or 1 hour
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token,
      tokenType: 'Bearer',
      expiresIn
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Projects routes
app.get('/projects', (req, res) => {
  try {
    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.post('/projects', (req, res) => {
  try {
    const { title, description, startDate, endDate, budget, progress = 0 } = req.body;

    const newProject = {
      id: Date.now().toString(),
      title,
      description,
      status: 'active',
      startDate,
      endDate,
      budget,
      progress,
      ownerId: '1', // Test user
      createdAt: new Date(),
      updatedAt: new Date()
    };

    projects.push(newProject);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Tasks routes
app.get('/tasks', (req, res) => {
  try {
    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.post('/tasks', (req, res) => {
  try {
    const { title, description, projectId, assigneeId, priority = 'medium', dueDate } = req.body;

    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      status: 'todo',
      priority,
      assigneeId,
      projectId,
      dueDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'YAP Nest API is running!',
    version: '1.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login'
      },
      projects: {
        list: 'GET /projects',
        create: 'POST /projects'
      },
      tasks: {
        list: 'GET /tasks',
        create: 'POST /tasks'
      }
    }
  });
});

// Export for Vercel
module.exports = app; 