DROP TABLE if EXISTS screenshots;

DROP TABLE if EXISTS subscriptions;

CREATE TABLE
    screenshots (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        username TEXT NOT NULL,
        ts TIMESTAMP NOT NULL,
        notes TEXT,
        image_data BYTEA
    );

CREATE TABLE
    subscriptions (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        subscription JSONB
    );