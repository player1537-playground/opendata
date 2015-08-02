#!/usr/bin/python

import sqlite3
from StringIO import StringIO
import requests
import os
import time
import csv
import datetime

schema = """
CREATE TABLE IF NOT EXISTS traffic (
  id INTEGER PRIMARY KEY,
  speed_id INTEGER,
  speed REAL,
  last_updated DATE
);
CREATE INDEX IF NOT EXISTS traffic_ingest_id_lnk ON traffic(ingest_id);
CREATE INDEX IF NOT EXISTS traffic_speed_id_lnk ON traffic(speed_id);
CREATE INDEX IF NOT EXISTS traffic_last_updated_lnk ON traffic(last_updated);

CREATE TABLE IF NOT EXISTS path (
  speed_id INTEGER PRIMARY KEY,
  link_points TEXT
);
"""

def parse_db_date(datestr):
    return datetime.datetime.strptime(datestr, "%Y-%m-%d %H:%M:%S")

def parse_csv_date(datestr):
    return datetime.datetime.strptime(datestr, "%m/%d/%Y %H:%M:%S")

def get_current_date():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def get_db():
    return sqlite3.connect('traffic.db')

def initialize_db(db):
    db.executescript(schema)
    db.commit()

def get_records():
    url = "http://207.251.86.229/nyc-links-cams/LinkSpeedQuery.txt"

    r = requests.get(url)

    with open(os.path.join("saved", get_current_date() + ".csv"), "w") as f:
        f.write(r.content)

    return csv.DictReader(StringIO(r.content), delimiter='\t')

def get_parsed_records(records):
    for record in records:
        if '<html>' in record:
            print "<html> found in record, skipping remaining records"
            break

        d = {
            "DataAsOf": parse_csv_date(record["DataAsOf"]),
            "Speed": float(record["Speed"]),
            "linkPoints": record["linkPoints"],
            "Id": int(record["Id"]),
        }

        yield d

def load_record(db, DataAsOf, Speed, Id, linkPoints, **kwargs):
    for row in download_data():
        cur = db.execute(('SELECT MAX(last_updated) '
                          'FROM traffic '
                          'WHERE speed_id = ?'),
                         [Id])

        max_last_updated = cur.fetchone()[0]
        last_updated = row["DataAsOf"]

        if last_updated > max_last_updated:
            newly_inserted += 1
            db.execute(('INSERT INTO traffic '
                        '  (ingest_id, speed_id, speed, last_updated) '
                        'VALUES '
                        '  (?, ?, ?, ?) '),
                       [new_ingest_id, speed_id, row["Speed"], last_updated])

        try:
            db.execute(('INSERT INTO '
                        '  path (speed_id, link_points) '
                        'VALUES '
                        '  (?, ?) '),
                       [speed_id, row["linkPoints"]])
        except sqlite3.IntegrityError:
            pass

    db.commit()
    print "%s: %d/%d records inserted" % (get_date(),
                                          newly_inserted,
                                          total_records)

def main():
    db = get_db()

    initialize_db(db)

    while True:
        ingest_data(db)
        time.sleep(55)


if __name__ == "__main__":
    main()
