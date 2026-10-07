# Week 2 - Backend Development (Node.js, Express, MongoDB)

You need Node.js and MongoDB (local, or a free MongoDB Atlas URI).

## Run any project
```
cd <project-folder>
npm install
cp .env.example .env      # then edit values (MONGO_URI, JWT_SECRET)
npm run dev
```
Server runs on http://localhost:5000. Never commit `.env` (it is in `.gitignore`).

## Assignment 1: To-Do List REST API  (`assignment1-todo-api`)
| Method | URL | Purpose |
|---|---|---|
| POST | /api/tasks | add task |
| GET | /api/tasks | list tasks (`?completed=true`) |
| GET | /api/tasks/:id | one task |
| PUT | /api/tasks/:id | update task |
| DELETE | /api/tasks/:id | delete task |

Postman: POST `/api/tasks`, Body > raw > JSON:
```json
{ "title": "Finish week 2", "description": "Build the APIs", "dueDate": "2026-10-20" }
```
Update example (PUT): `{ "completed": true }`

## Assignment 2: User Authentication API  (`assignment2-auth-api`)
| Method | URL | Purpose |
|---|---|---|
| POST | /api/auth/register | create account (password hashed with bcrypt) |
| POST | /api/auth/login | returns JWT |
| GET | /api/auth/me | protected, needs token |

Register body: `{ "name": "Harsh", "email": "harsh@example.com", "password": "secret123" }`
Login body: `{ "email": "harsh@example.com", "password": "secret123" }`
For protected routes in Postman: Authorization tab > Bearer Token > paste the token from login.

## Mini Project: Notes App Backend  (`mini-project-notes-api`)
Same register/login routes, plus JWT-protected notes CRUD. Each user sees only their own notes.
| Method | URL | Purpose |
|---|---|---|
| POST | /api/notes | create note |
| GET | /api/notes | list (`?search=word&tag=work&pinned=true`) |
| GET | /api/notes/:id | one note |
| PUT | /api/notes/:id | update note |
| DELETE | /api/notes/:id | delete note |

Create body: `{ "title": "Meeting", "content": "Discuss API design", "tags": ["work"], "pinned": true }`
Without a valid token every `/api/notes` request returns 401.
