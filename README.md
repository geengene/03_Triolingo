# TRIOLINGO

## Project Setup

Follow these instructions to set up the project locally on your machine.

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- [Git](https://git-scm.com/)
- [Python]

### Installation

1. **Clone the repository:**

```sh
git clone https://github.com/geengene/03_Triolingo.git
cd 03_Triolingo
```

2. **Install dependencies:**

```sh
npm install
create a python venv within project folder: `python -m venv venv` for the required dependencies
```

### Running the Project

1. **log in to duolingo**
   - get jwt login token by pasting this command into your console: `document.cookie.match(new RegExp('(^| )jwt_token=([^;]+)'))[0].slice(11) `
2. **create a local database**
   using postgres' pgadmin 4, setup a database with whatever name you prefer.
3. **create an .env file**
   fill in the respective details:
   DUOLINGO_USERNAME=
   DUOLINGO_JWT=
   DB_NAME=
   USER_NAME=postgres
   PASSWORD=
   HOST=localhost
   PORT=5432
4. **Start the development server:**

```sh
node index.js
```

2. Open your browser and navigate to `http://localhost:3000` to see the application running.

### Building for Production

To create a production build, run:

```sh
npm run build
```

### Running Tests

To run tests, use:

```sh
npm test
```

## Project Structure

- `public/` - Contains the static assets
- `package.json` - Lists the project's node dependencies and scripts
- `requirements.txt` - Lists the python libraries required

## Road Map

- currently only practising vocabulary works
- plans to incorporate, pronunciation, writing and reading function for an all encompassing learning experience.
- add user authentication
- add session management

## Contributing

If you wish to contribute to this project, please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request

## License

This project is licensed under the MIT License.
