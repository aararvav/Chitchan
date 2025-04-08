# chitchan

## 🗺️
- **Frontend** – Jinja (HTML Templating)
- **Backend** – Flask (Python Server)
- **Database** – SQLite

---

## 🛠️ Setup Instructions (Windows Only)

Follow these steps to set up `chitchan` on **Windows**:

### 1. Clone this Repository

```
git clone https://github.com/arunwastaken/Testchan.git
cd chitchan
```
### 2. Install SQLite3 

* [install sqlite3](https://www.sqlite.org/download.html)

* Video guide to install SQLite3 [watch](https://youtu.be/L3FwRRx6bqo?si=JuPtQyfMNHSPop4q)

### 3. Install Python (If Not Already Installed) 

* ⚠️ Important: During installation, make sure to check the box that says "Add Python to PATH".

* [install python](https://www.python.org/downloads/windows/)

### 4. Install Flask
```
pip install flask
```

### 5. Setup database
```
sqlite3 chitchan.db
```

### 6. Run Flask

```
 $env:FLASK_APP = "server.py"; flask run
 ```

 or

 ```
 python server.py
```


