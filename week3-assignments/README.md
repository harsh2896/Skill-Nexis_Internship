# Week 3 - Full Stack Integration (React + Express + MongoDB)

Each project has a `server` and a `client` folder. Run them in **two terminals**.
You need Node.js and MongoDB (local, or a free MongoDB Atlas URI).

## Run
```
# terminal 1 - server
cd <project>/server
npm install
cp .env.example .env      # set MONGO_URI and JWT_SECRET (not needed for the image project)
npm run dev               # http://localhost:5000

# terminal 2 - client
cd <project>/client
npm install
npm run dev               # http://localhost:5173
```
Open http://localhost:5173. The Vite proxy forwards `/api` to the server, so no CORS setup is needed.

## Assignment 1: Full Stack To-Do (`assignment1-fullstack-todo`)
Register / login with JWT, protected routes (React Router), Context API for auth state, per-user task CRUD with form validation.
API: `POST /api/auth/register`, `POST /api/auth/login`, `GET|POST /api/tasks`, `PUT|DELETE /api/tasks/:id` (tasks need `Authorization: Bearer <token>`).

## Assignment 2: Image Upload (`assignment2-image-upload`)
Multer endpoint with type and 2 MB size checks, React preview before upload, upload progress, gallery and delete.
API: `POST /api/upload` (form-data, key `image`), `GET /api/images`, `DELETE /api/images/:filename`.
Postman: Body > form-data > key `image`, type File.

## Mini Project: Task Manager (`mini-project-task-manager`)
Everything from Assignment 1 plus status (todo / in-progress / done), priority, due date, status tabs with counts, search, priority filter and sorting (filters run on the server).
API extras: `GET /api/tasks?status=&priority=&search=&sort=newest|oldest|dueDate|priority`, `GET /api/tasks/stats`.
