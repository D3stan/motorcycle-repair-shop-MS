# Motorcycle Repair Shop
Management system for dummy motorcycle repair shop as project for the Data Modeling and Databases course.

## Main focus
The main focus revolves around the [Entity-Relation scheme](ER-Scheme.lun) developed using [DBMain](https://www.db-main.eu/) software.  
The scheme was then simplified to match a _mysql_ DBMS structure.
After that, a WebApp demo was created to let the final user have a working UI to interact with the database.  
This WebApp is based on [Laravel-React](https://laravel.com/docs/12.x/starter-kits#react) starter kit and takes advantage of its ORM to interact with the database.  
It also features an MVC architecture.

## Local Setup

0. **Requirements**
    - PHP 8
    - Composer
    - Node.js

1.  Clone the repository and enter the `shop` directory.

2.  **Install Dependencies:**
    ```bash
    composer install
    npm install
    ```

3.  **Configure Environment:**
    -   Copy `.env.example` to `.env`.
    -   Generate app key: `php artisan key:generate`
    -   Update `.env` with your database credentials.

4.  **Setup Database:**
    ```bash
    php artisan migrate:refresh --seed
    ```

5.  **Run Development Server:**
    ```bash
    composer run dev
    ```
    The application will be available at http://localhost:8000 or http:/127.0.0.1:8000/.

6. **Credentials:**

    Admin User: `admin@shop.com`  
    Others: **check DB for email**  
    Password for all users: `password`  