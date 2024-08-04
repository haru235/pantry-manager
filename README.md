
# Pantry Recipe Dashboard

A web application that helps users manage their pantry items and provides recipe recommendations based on the available pantry items.

## Features

- **Pantry Management**: Add, edit, and delete pantry items.
- **Recipe Recommendations**: View recipe recommendations based on pantry items.
- **Search Functionality**: Search for pantry items.
- **Responsive Design**: Works well on both desktop and mobile devices.

## Tech Stack

- **Frontend**: React, Next.js, Material-UI
- **Backend**: Firebase
- **APIs**: OpenAI for recipe recommendations

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm or yarn

### Installation

1. **Clone the repository**

- git clone https://github.com/yourusername/pantry-manager.git
- cd pantry-recipe-dashboard

2. Install dependencies

npm install
# or
yarn install

3. Set up Firebase

Create a Firebase project at Firebase Console
Add a new web app to the project
Copy the Firebase configuration and replace the placeholders in src/firebase.js:

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

4. Set up OpenAI API

- Get your OpenAI API key from OpenAI
- Replace the placeholder in your API call file (e.g., src/api/recipes.js) with your OpenAI API key:

const openai = new OpenAI(process.env.OPENAI_API_KEY);

5. Run the development server

npm run dev
# or
yarn dev

4. Open http://localhost:3000 to see the application in action.

##Usage
1. Add Pantry Items

Click the "Add Item" button to add a new pantry item.
Fill in the details and save.

2. Edit or Delete Pantry Items

Use the edit and delete icons next to each pantry item to modify or remove them.

3. View Recipe Recommendations

The right section displays recipes based on the items in your pantry.

##Folder Structure

pantry-manager/
├── public/
├── app/
│   ├── api/
│   │   ├── recipes
│   │   │   └── route.js
│   │   └── shoppingLists
│   │   │   └── route.js
│   ├── page.js
│   └── layout.js
├── .gitignore
├── README.md
├── firebase.js
├── package.json
└── next.config.js

##Contributing

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a pull request

##License

Distributed under the MIT License. See LICENSE for more information.

##Contact
Haru - harusakai0515@gmail.com




