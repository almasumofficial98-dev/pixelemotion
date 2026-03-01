from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/arrange")
def arrange():
    layout_str = request.args.get("layout", "")
    items_str = request.args.get("items", "")
    message = request.args.get("msg", "")
    
    readonly = request.args.get("readonly", "0") == "1"

    items = []

    if layout_str:
        elements = layout_str.split(",")
        for element in elements:
            parts = element.split(":")
            if len(parts) >= 3:
                try:
                    x = float(parts[1])
                    y = float(parts[2])
                    scale = float(parts[3]) if len(parts) >= 4 else 1.0
                    # Parse z-index, or fallback to default based on item type
                    z_index = int(parts[4]) if len(parts) == 5 else (1 if parts[0].startswith('L') else 10)
                except ValueError:
                    continue
                items.append({
                    "id": parts[0],
                    "x": x,
                    "y": y,
                    "scale": scale,
                    "z_index": z_index
                })
    elif items_str:
        for item_id in items_str.split(","):
            if item_id:
                default_scale = 1.5 if item_id.startswith('L') else 1.0
                default_z = 1 if item_id.startswith('L') else 10
                items.append({
                    "id": item_id, 
                    "x": "", 
                    "y": "", 
                    "scale": default_scale, 
                    "z_index": default_z
                })

    return render_template(
        "arrange.html",
        items=items,
        message=message,
        readonly=readonly
    )

@app.route("/create", methods=["POST"])
def create():
    items = request.form.getlist("items[]")
    msg = request.form.get("message", "")
    return redirect(url_for("arrange", items=",".join(items), msg=msg))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)