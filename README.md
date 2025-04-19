# Chitchan

A modern image-based bulletin board platform inspired by 4chan, built with Node.js and Express.

## Team

### Divyansh Verma – Team Lead
### Arun Singh – Backend Engineer
### Abhishek Kumar – Content Strategist
### Aaravbir Singh Bhatia – Frontend Engineer
### Anant Sagar – UI/UX Designer

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chitchan.git
cd chitchan
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=chitchan_db
```

4. Set up the database:
```bash
npm run setup-db
```

## Setup Steps

 **Database Configuration**
   - Ensure MySQL is installed and running
   - Create a new database named 'chitchan_db'
   - Update the `.env` file with your database credentials

 **Server Configuration**
   - The default port is 4000
   - Update the port in `.env` if needed
   - Ensure all required ports are available

 **Running the Application**
   - Start the server:
   ```bash
   node app.js
   ```

6. **Accessing the Application**
   - Open your browser and navigate to `http://localhost:4000`
   - The default admin credentials are:
     - Username: admin
     - Password: admin123
   - Change these credentials immediately after first login

## Features

- Image-based bulletin board system
- Multiple themed boards
- Real-time updates
- User authentication
- File upload support
- Mobile-responsive design

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


A 4chan clone that is written in NodeJS. No front-end libraries are used. It's all vanilla JS, CSS and HTML.


Getting Started
-------------
Make sure you have Node.js, NPM, and a MySQL Server installed.
With MySQL, create a database. If you are lazy, copy this command in insert into the MySQL terminal. ``CREATE DATABASE `chitchan`;``

* Run `npm install`
* Run `node app.js` and you will have your own instance of 4chan running on your localhost! 





