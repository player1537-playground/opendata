from flask import Flask
from flask import render_template, url_for, g, Response

import os
import os.path
import datetime
import sqlite3
import json

app = Flask(__name__)
app.root_path = os.path.abspath(os.path.dirname(app.root_path))

visualizations = {
    "timeplot": "timeplot.js",
    "basic_map": "basic_map.js"
}

def connect_to_database():
    return sqlite3.connect('traffic.db.bak')

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_to_database()
    return db

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

api_by_date_select_sql = """
SELECT t1.speed_id

     , (SELECT MAX(t2.last_updated)
        FROM traffic AS t2
        WHERE
          t2.speed_id = t1.speed_id
        AND
          t2.last_updated < :date)
       AS prev_last_updated

     , (SELECT t3.speed
        FROM traffic AS t3
        WHERE
          t3.speed_id = t1.speed_id
        AND
          t3.last_updated < :date
        ORDER BY t3.last_updated DESC
        LIMIT 1)
       AS prev_speed

     , (SELECT MIN(t4.last_updated)
        FROM traffic AS t4
        WHERE
          t4.speed_id = t1.speed_id
        AND
          t4.last_updated > :date)
       AS next_last_updated

     , (SELECT t5.speed
        FROM traffic AS t5
        WHERE
          t5.speed_id = t1.speed_id
        AND
          t5.last_updated > :date
        ORDER BY t5.last_updated
        LIMIT 1)
       AS next_speed

FROM traffic AS t1
GROUP BY t1.speed_id
HAVING prev_last_updated IS NOT NULL
AND    prev_speed IS NOT NULL
AND    next_last_updated IS NOT NULL
AND    next_speed IS NOT NULL
AND    JULIANDAY(next_last_updated) - JULIANDAY(prev_last_updated) < :threshold
"""

@app.route("/api/by_date/<datestr>")
def api_by_date(datestr):
    try:
        date = datetime.datetime.strptime(datestr, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return "", 404

    threshold = 1. / 24. / 60. * 5 # 5 minutes

    results = query_db(api_by_date_select_sql, { "date": date,
                                                 "threshold": threshold })

    d = {
        speed_id: {
            "prev_date": p_date,
            "prev_speed": p_speed,
            "next_date": n_date,
            "next_speed": n_speed,
            "avg_speed": (p_speed + n_speed) / 2.
        }
        for (speed_id, p_date, p_speed, n_date, n_speed) in results
    }

    return Response(json.dumps(d, indent=2), mimetype='text/json')

api_link_points_select_sql = """
SELECT speed_id
     , link_points
FROM path
GROUP BY speed_id
"""

@app.route("/api/link_points")
def api_link_points():
    results = query_db(api_link_points_select_sql)

    def p(x):
        print x
        return x

    def link_points_to_list(link_points):
        lst = []
        for point_str in link_points.split(' '):
            try:
                (lat, lng) = point_str.split(',')
                if '.' not in lat or '.' not in lng:
                    continue

                point = map(float, (lat, lng))
                lst += [point]
            except:
                pass

        return lst



    d = {
        speed_id: link_points_to_list(link_points)
        for (speed_id, link_points) in results
    }

    return Response(json.dumps(d, indent=2), mimetype='text/json')

################################################################

@app.route("/viz/<which>")
def viz(which):
    if which not in visualizations:
        return "Visualization not found", 404

    return render_template("viz.html", which=which, js=visualizations[which])

@app.route("/")
def index():
    data = { "visualizations": visualizations.items() }

    return render_template("index.html", **data)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8889, debug=True)
