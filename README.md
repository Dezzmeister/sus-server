# Setup

1. Clone the repository:

    `git clone git@github.com:Dezzmeister/sus-server.git`

2. Install [nvm](https://github.com/nvm-sh/nvm) (Mac/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows).
3. Install NodeJS 16.2.0:

    `nvm install 16.2.0`

4. Install yarn globally:

    `npm i -g yarn@1.22.10`

5. `cd` into the project directory and install project dependencies:

    `yarn`

## Database

1. Download and install [PostgreSQL 13.0](https://www.postgresql.org/download/).
2. Create a postgres role:

    `createuser -U postgres -P dev`

    The database config at `src/mikro-orm.config.ts` specifies that the password for this role is `dev`, so be sure to change the config if you set the password to anything different.

3. Create the database and make `dev` the owner:

    `createdb -U postgres -O dev sus`

4. Run migrations to populate the database schema:

    `yarn migrate`

    If this fails, `npx mikro-orm debug` may provide some info.

5. The database needs to be seeded with an initial user. Run

    `psql -U dev -d sus`

    to connect to the database.

6. Run the following query to add a user with email `admin@gmail.com` and password `password1`:

    `INSERT INTO "user"(id, email, username, password_hash, permissions) VALUES (1,'admin@gmail.com','admin','$2a$12$Hvrpy/ExRl7e8GvbyBN6TOi8mEm5zjUpCDHQWpq47651ObhRMa91a','{*}');`

# Development

VSCode is recommended for development. Run `yarn start` to start the server with hot reload, so that you can see changes live as you save them. To create a production build, run `yarn build:prod`, and `yarn start:prod` to run the build.

Either [Postman](https://www.postman.com/) or [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client) is recommended for testing the API endpoints.
