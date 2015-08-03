#!/usr/bin/python

import sqlite3
from StringIO import StringIO
import requests
import os
import time
import csv
import datetime
import tarfile

schema = """
CREATE TABLE IF NOT EXISTS traffic (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  speed_id INTEGER,
  speed REAL,
  last_updated DATE
);
CREATE INDEX IF NOT EXISTS traffic_speed_id_last_updated_speed_lnk
ON traffic(speed_id, last_updated, speed);

CREATE TABLE IF NOT EXISTS path (
  speed_id INTEGER PRIMARY KEY,
  encoded_polyline TEXT
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

def get_saved_ingests(filename):
    with tarfile.open(filename, 'r') as tar:
        for tarinfo in tar:
            if not tarinfo.isfile():
                continue
            f = tar.extractfile(tarinfo)

            yield (tarinfo.name, f)
            tar.members = []

def get_web_ingests(*args):
    url = "http://207.251.86.229/nyc-links-cams/LinkSpeedQuery.txt"

    while True:
        try:
            r = requests.get(url)

            filename = os.path.join("saved", get_current_date() + ".csv")
            with open(filename, "w") as f:
                f.write(r.content)

            yield (filename, StringIO(r.content))
        except ex:
            print "Ignoring exception", ex

        time.sleep(30)

def get_records(ingest):
    return csv.DictReader(ingest, delimiter="\t")

def get_parsed_records(records):
    for record in records:
        if '<html>' in record:
            print "<html> found in record, skipping remaining records"
            break

        d = {
            "DataAsOf": parse_csv_date(record["DataAsOf"]),
            "Speed": float(record["Speed"]),
            "EncodedPolyLine": record["EncodedPolyLine"],
            "Id": int(record["Id"]),
        }

        yield d

def load_record(db, DataAsOf, Speed, Id, EncodedPolyLine, **kwargs):
    cur = db.execute(('SELECT MAX(last_updated)'
                      'FROM traffic '
                      'WHERE speed_id = ? '),
                     [Id])

    max_last_updated = cur.fetchone()[0]

    if max_last_updated is not None:
        max_last_updated = parse_db_date(max_last_updated)

    if max_last_updated is None or DataAsOf > max_last_updated:
        db.execute(('INSERT INTO traffic '
                    '  (speed_id, speed, last_updated) '
                    'VALUES '
                    '  (?, ?, ?)'),
                   [Id, Speed, DataAsOf])

    db.execute(('INSERT OR IGNORE '
                'INTO path '
                '  (speed_id, encoded_polyline) '
                'VALUES '
                '  (?, ?) '),
               [Id, EncodedPolyLine])

def main(from_where, filename):
    db = get_db()

    initialize_db(db)

    get_ingests_map = { "web": get_web_ingests, "saved": get_saved_ingests }
    get_ingests = get_ingests_map[from_where]

    for (ingest_name, ingest) in get_ingests():
        print "Loading %s" % ingest_name
        for record in get_parsed_records(get_records(ingest)):
            load_record(db, **record)
        db.commit()

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--from', dest='from_where', choices=['web', 'saved'])
    parser.add_argument('filename', nargs='?')
    args = parser.parse_args()

    main(**vars(args))
