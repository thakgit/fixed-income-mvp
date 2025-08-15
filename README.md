# 🚀 Fixed-Income AI Platform

AI-powered fixed-income portfolio management platform with real-time analytics, risk assessment, and compliance monitoring.

## ✨ Features

- **Portfolio Overview** - AI-powered insights and analytics
- **Loans Management** - Comprehensive loan tracking and management
- **Document Hub** - Centralized document storage and retrieval
- **Compliance Monitoring** - Automated compliance checks and reporting
- **Risk Analytics** - Advanced risk assessment and modeling
- **AI Assistant** - Natural language portfolio queries
- **Upload Center** - Document ingestion and processing

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **Alembic** - Database migration tool
- **PostgreSQL** - Production database
- **JWT** - Authentication and authorization

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool
- **React Router** - Client-side routing

### AI & ML
- **OpenAI GPT** - Natural language processing
- **Pinecone** - Vector database for embeddings
- **RAG** - Retrieval-Augmented Generation

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (for production)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fixed-income-mvp.git
   cd fixed-income-mvp
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Copy environment variables
   cp env.example .env
   # Edit .env with your API keys
   
   # Run the backend
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Copy environment variables
   cp env.example .env
   # Edit .env with your backend URL
   
   # Run the frontend
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🌐 Deployment

### 1. GitHub Repository

1. **Create a new repository** on GitHub
2. **Push your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Fixed-Income AI Platform"
   git branch -M main
   git remote add origin https://github.com/yourusername/fixed-income-mvp.git
   git push -u origin main
   ```

### 2. Backend Deployment (Render)

1. **Sign up** for [Render](https://render.com)
2. **Connect your GitHub repository**
3. **Create a new Web Service**:
   - **Name**: `fixed-income-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Add environment variables**:
   - `DATABASE_URL` (Render will provide this)
   - `SECRET_KEY` (generate a secure key)
   - `OPENAI_API_KEY` (your OpenAI API key)
   - `PINECONE_API_KEY` (your Pinecone API key)
   - `PINECONE_ENVIRONMENT` (your Pinecone environment)
   - `PINECONE_INDEX_NAME` (your Pinecone index name)
5. **Deploy** and note your backend URL

### 3. Frontend Deployment (Netlify)

1. **Sign up** for [Netlify](https://netlify.com)
2. **Connect your GitHub repository**
3. **Configure build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. **Add environment variables**:
   - `VITE_API_URL`: Your Render backend URL
5. **Deploy** and note your frontend URL

### 4. Update Frontend API URL

1. **Update your frontend environment** with the production backend URL
2. **Redeploy** the frontend

## 🔧 Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX_NAME=your-pinecone-index-name
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend-name.onrender.com
```

## 📁 Project Structure

```
fixed-income-mvp/
├── backend/                 # FastAPI backend
│   ├── app/                # Application code
│   ├── alembic/            # Database migrations
│   ├── requirements.txt    # Python dependencies
│   └── render.yaml         # Render deployment config
├── frontend/               # React frontend
│   ├── src/                # Source code
│   ├── package.json        # Node dependencies
│   └── netlify.toml        # Netlify deployment config
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🤝 Contributing

This project is co-created by:
- **Jayesh Thakkar** - Product Vision & Business Strategy
- **Cursor AI** - Full-Stack Implementation

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For support and questions, please contact:
- **Jayesh Thakkar**: thakkar.jayesh@gmail.com
- **Project Repository**: [GitHub Issues](https://github.com/yourusername/fixed-income-mvp/issues)
