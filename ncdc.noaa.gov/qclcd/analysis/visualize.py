from flask import Flask
from flask import render_template, url_for

import os
import os.path

app = Flask(__name__)
app.root_path = os.path.abspath(os.path.dirname(app.root_path))

progs = ["approximate", "precipitation", "feature_view", "clusters", "voronoi"]

cache = {}

@app.route("/viz/<prog>")
def viz(prog):
    if prog not in progs:
        raise Exception("Bad program")
    return render_template(prog + ".html")

@app.route("/precipitation")
def precipitation():
    import scipy.io
    import json

    cache_name = "precipitation"

    if cache_name in cache:
        return cache[cache_name]

    matrices = scipy.io.loadmat("gen/precip/201505.mat")
    matrix = matrices["precip"]
    locations = matrices["locations"]

    ret = []
    for i, row in enumerate(matrix):
        for j, val in enumerate(row):
            if val != 0:
                ret.append((i, j, val, locations[i][0], locations[i][1]))

    cache[cache_name] = json.dumps({ "precip": ret })

    return cache[cache_name]


@app.route("/approximate/<int:n_components>")
def approximate(n_components):
    import scipy.io
    import json
    import numpy as np

    matrices = scipy.io.loadmat('gen/precip_approx/201505.mat')
    W = matrices["W%d" % n_components]
    H = matrices["H%d" % n_components]
    locations = matrices["locations"]

    return json.dumps({
        "W": W.tolist(),
        "H": H.tolist(),
        "locations": locations.tolist()
    })

@app.route("/clusters/<date>/<int:n_components>")
def cluster(date, n_components):
    import scipy.io
    import json
    import numpy as np

    clusters_path = os.path.join("gen", "clusters", date + ".mat")
    clusters_mat = scipy.io.loadmat(clusters_path)
    clusters = clusters_mat["cluster%d" % n_components][0]

    return json.dumps({
        "clusters": clusters.tolist()
    })

@app.route("/precipitation/list")
def precipitation_list():
    files = os.listdir(os.path.join('gen', 'precip_approx'))

    dates = [filename[:-len(".mat")] for filename in files]

    return render_template("precipitation_list.html", dates=dates)

@app.route("/")
def index():
    print app.root_path

    routes = [(p, url_for("viz", prog=p)) for p in progs]

    return render_template("index.html", routes=routes)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8888, debug=True)
