# Student Management React Frontend

This is the standalone React frontend for the Student Management application.

It consumes the Flask backend API running on `http://localhost:5000` via the Webpack dev server proxy.

## Setup

```bash
cd student_mgmt_react
npm install
```

## Run locally

```bash
npm start
```

or

```bash
npm run dev
```

The app will start on `http://localhost:3000` and proxy API requests to the backend.

## Build

```bash
npm run build
```

## Notes

- The backend must be running separately before using the frontend.
- API calls use `/api/students` and rely on the backend proxy configured in `webpack.config.cjs`.
