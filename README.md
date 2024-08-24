# developer-test-3a

## Running the code

### Requirements

- `docker` and `docker compose` must be installed

- Ports 3131, 3232 and 3434 must not be reserved on the host 

### Commands

- Run `docker compose up` to start the environment (or `docker compose up -d` to start it in the background)

### Urls

- Open `http://localhost:3232` to view the web ui

- Open `http://localhost:3434` to open Adminer and browse the PostgreSQL database:

  - Database type: PostgresSQL

  - Server: `db`

  - Username: `dev`

  - Password: `dev`

  - Database name: `app`

- `http://localhost:3131` is just for the API between client and server

## Automated tests

- Currently there are a few integration/API tests to check that e.g. data import, currencies and translations work as expected

- I used Jest as the test runner because I previous experience with it

- For a real-world project, additional tests could be added to ensure everything works as expected, depending on factors such as the project's criticality and the potential impact of bugs

- run `./run-api-tests.sh` to start tests

## Implementation

### Technologies

- Since the requirement was to save the data to SQL database, I decided to set up an environment with Docker to make it portable

- For database I used PostgreSQL because that's what I have used the most lately

- For querying the database I used the Nodejs package [Kysely](https://github.com/kysely-org/kysely). I used this because I have read about it and wanted to give it a try

- While it was not in the requirements, I decided to implement a simple frontend with React

  - I needed some way to trigger the import from the product API anyway, a web UI seemed like a nice user friendly solution

  - Another option would have been some kind of command line utility 

### Database design

#### Structure

- I decided to use six tables:

  - product

  - product_translations (translations for translatable product fields)

  - category

  - category_translations (translations for translatable category fields)

  - product_category (links products to categories)

  - currency_exchange_rates (support for extra currencies through conversion)

#### Saving only parts that have changed 

- Given the limited specs available (I did this over weekend, so couldn't ask more details with email), I had to make some assumptions here

- The instructions said:

  - "How to update the product data from the API without re-saving everything but only parts that have changed" 

  - "Also note that not every object have IDs" 

- Which to me suggests that I need to have some way to identify a resource for update.

- And since apparently not every object has an ID, I can't use the id/uuid (although every object in the sample data does have an uuid)

- For this reason I decided to do the updates based on product/category name and assumed it is an unique identifier of the resource

- If every object has an ID/uuid, then of course that is what should be used since there could e.g. be different products with the same name

- I did implement some basic logic to only update product/category if some of it's values are changed

  - I didn't see the point of doing it more granularly, since we are making the DB update request at that point anyway.


#### Schemaless data (variations)

- Task: "Figure a way to handle schemaless data (variations)"

- For this I used a JSON field in the SQL database

#### Currencies

- Task: "Add support for extra currencies"

- Wasn't sure what exactly the requirements here were, but I created a currency exchange rates table where you can set exchange rates for other currencies

- The prices can then be set based on the exchange rate of the selected currency when products are fetched from the db

