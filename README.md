# Pantry Management and Recipe Recommendation App

## Overview

This application helps manage pantry items and provides recipe recommendations based on the available ingredients. It allows users to add, update, and delete pantry items, and it can generate recipe suggestions using the pantry's contents.

## Features

- **Pantry Management**: Add, edit, and delete pantry items.
- **Search Functionality**: Filter pantry items based on a search query.
- **Recipe Recommendations**: Generate recipe ideas using pantry items.
- **Expiration Handling**: Highlight expired items and delete them if necessary.

## Technologies Used

- **Frontend**: React, Material-UI
- **Backend**: Firebase Firestore
- **API**: OpenAI (for recipe recommendations)
- **Utilities**: `date-fns` (for date calculations)

## Setup

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/pantry-management-app.git
    cd pantry-management-app
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Configure Firebase:**

    Create a file named `.env.local` in the root directory of your project with the following content:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
    ```

    Replace the placeholder values with your Firebase project configuration.

4. **Run the development server:**

    ```bash
    npm run dev
    ```

    Your app should now be running at `http://localhost:3000`.

## Usage

- **Pantry Management**:
  - Add new items using the "Add New Item" button.
  - Edit existing items by clicking the edit icon next to the item.
  - Delete items using the delete icon.

- **Search**:
  - Use the search bar to filter pantry items by name.

- **Recipe Recommendations**:
  - Click the "Generate Recipes" button to get recipe suggestions based on the pantry items.

## API Integration

### Recipe Recommendations

The recipe recommendations are fetched from an external API. Make sure to configure the API endpoint in `api/recipe.js` and handle any required authentication.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request to contribute to this project.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any questions or feedback, please contact [your-email@example.com](mailto:your-email@example.com).

