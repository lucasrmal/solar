-- Production
-- -------------
-- Year (PK)
-- Month (PK)
-- Day (PK)
-- Hour (PK) #  24-hr format. UTC.
-- Wh

CREATE TABLE Production (
  year INT NOT NULL,
  month INT NOT NULL,
  day INT NOT NULL,
  hour INT NOT NULL,
  watt_hour INT NOT NULL,

  PRIMARY KEY (year, month, day, hour)
);


-- ApiKey
-- ------

-- ApiKey (PK)

CREATE TABLE ApiKey (
  api_key VARCHAR(20) NOT NULL,
  PRIMARY KEY (api_key)
);

-- INSERT INTO ApiKey VALUES ('abc123');


-- RawProduction

CREATE TABLE RawProduction (
  year INT NOT NULL,
  month INT NOT NULL,
  day INT NOT NULL,
  hour INT NOT NULL,
  minute INT NOT NULL,
  watts INT NOT NULL,

  PRIMARY KEY (year, month, day, hour, minute)
);
