import os
from flask import flash
from io import BytesIO
import csv
from io import StringIO
from datetime import datetime

from flask import Flask, Response, redirect, render_template, request, session, url_for
from flask_sqlalchemy import SQLAlchemy
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.secret_key = "expense_tracker_secret_key"

# Database Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL",
    "sqlite:///expense_tracker.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class User(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(100), unique=True, nullable=False)

    password = db.Column(db.String(255), nullable=False)

    budget = db.Column(db.Float, default=10000)


class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        if not name or not email or not password:
            return "All fields are required"

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return "Email already registered"

        new_user = User(
            name=name,
            email=email,
            password=generate_password_hash(password)
        )
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for("login"))

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):

            session["user_id"] = user.id
            session["user_name"] = user.name

            flash(
                f"Welcome back, {user.name}! 🎉",
                "success"
            )

            return redirect(url_for("dashboard"))

        flash("Invalid Email or Password ❌", "danger")

    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

@app.route("/profile", methods=["GET", "POST"])
def profile():

    if "user_id" not in session:
        return redirect(url_for("login"))

    user = User.query.get(session["user_id"])

    if request.method == "POST":

        user.budget = float(request.form["budget"])

        db.session.commit()

        flash(
            "Budget Updated Successfully! ✅",
            "success"
        )

        return redirect(url_for("profile"))

    return render_template(
        "profile.html",
        user=user
    )

@app.route("/dashboard")
def dashboard():

    if "user_id" not in session:
        return redirect(url_for("login"))

    user = User.query.get(session["user_id"])

    expenses = Expense.query.filter_by(
        user_id=session["user_id"]
    ).order_by(
        Expense.date.desc()
    ).all()

    total_expenses = len(expenses)
    total_amount = sum(expense.amount for expense in expenses)

    budget = user.budget
    remaining = budget - total_amount

    # Category Totals
    category_totals = {}

    for expense in expenses:
        category_totals[expense.category] = (
            category_totals.get(expense.category, 0)
            + expense.amount
        )

    categories = list(category_totals.keys())
    amounts = list(category_totals.values())

    # Monthly Trend
    monthly_data = {}

    for expense in expenses:
        month = expense.date.strftime("%b %Y")

        if month not in monthly_data:
            monthly_data[month] = 0

        monthly_data[month] += expense.amount

    months = list(monthly_data.keys())
    monthly_amounts = list(monthly_data.values())

    # Top Category
    top_category = "N/A"

    if category_totals:
        top_category = max(
            category_totals,
            key=category_totals.get
        )

    return render_template(
        "dashboard.html",
        expenses=expenses,
        total_expenses=total_expenses,
        total_amount=total_amount,
        budget=budget,
        remaining=remaining,
        categories=categories,
        amounts=amounts,
        months=months,
        monthly_amounts=monthly_amounts,
        top_category=top_category
    )

@app.route("/add_expense", methods=["GET", "POST"])
def add_expense():

    if "user_id" not in session:
        return redirect(url_for("login"))

    user = User.query.get(session["user_id"])

    if request.method == "POST":

        date_value = request.form.get("date")

        try:
            parsed_date = datetime.strptime(
                date_value,
                "%Y-%m-%d"
            ).date()
        except (TypeError, ValueError):
            return "Invalid date format"

        expense = Expense(
            category=request.form.get("category", "").strip(),
            amount=float(request.form.get("amount", 0)),
            description=request.form.get("description", "").strip(),
            user_id=session["user_id"],
            date=parsed_date
        )

        db.session.add(expense)
        db.session.commit()

        flash("Expense Added Successfully!", "success")

        return redirect(url_for("view_expenses"))

    return render_template(
        "add_expense.html",
        budget=user.budget
    )

@app.route("/view_expenses")
def view_expenses():
    if "user_id" not in session:
        return redirect(url_for("login"))

    search = request.args.get("search", "").strip()
    filter_date = request.args.get("date", "").strip()

    expenses = Expense.query.filter_by(user_id=session["user_id"])

    if search:
        expenses = expenses.filter(Expense.category.contains(search))

    if filter_date:
        try:
            selected_date = datetime.strptime(filter_date, "%Y-%m-%d").date()
            expenses = expenses.filter(Expense.date == selected_date)
        except ValueError:
            return "Invalid date format"

    expenses = expenses.order_by(Expense.date.desc()).all()
    total_amount = sum(expense.amount for expense in expenses)

    return render_template(
        "view_expenses.html",
        expenses=expenses,
        search=search,
        filter_date=filter_date,
        total_amount=total_amount,
    )


@app.route("/edit_expense/<int:id>", methods=["GET", "POST"])
def edit_expense(id):

    if "user_id" not in session:
        return redirect(url_for("login"))

    expense = Expense.query.filter_by(
        id=id,
        user_id=session["user_id"]
    ).first_or_404()

    if request.method == "POST":

        expense.category = request.form["category"]
        expense.amount = float(request.form["amount"])
        expense.description = request.form["description"]

        expense.date = datetime.strptime(
            request.form["date"],
            "%Y-%m-%d"
        ).date()

        db.session.commit()

        return redirect(url_for("view_expenses"))

    return render_template(
        "edit_expense.html",
        expense=expense
    )


@app.route("/delete_expense/<int:id>")
def delete_expense(id):
    if "user_id" not in session:
        return redirect(url_for("login"))

    expense = Expense.query.filter_by(id=id, user_id=session["user_id"]).first_or_404() 
    db.session.delete(expense)
    db.session.commit()

    flash("Expense Deleted Successfully!", "danger")

    return redirect(url_for("view_expenses"))

@app.route("/export_csv")
def export_csv():

    if "user_id" not in session:
        return redirect(url_for("login"))

    expenses = Expense.query.filter_by(
        user_id=session["user_id"]
    ).all()

    output = StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "ID",
        "Category",
        "Amount",
        "Description",
        "Date"
    ])

    for expense in expenses:
        writer.writerow([
            expense.id,
            expense.category,
            expense.amount,
            expense.description,
            expense.date
        ])

    csv_data = output.getvalue()

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=expenses.csv"
        }
    )

@app.route("/export_pdf")
def export_pdf():
    if "user_id" not in session:
        return redirect(url_for("login"))

    expenses = Expense.query.filter_by(user_id=session["user_id"]).all()

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer)
    data = [["ID", "Category", "Amount", "Description"]]

    for expense in expenses:
        data.append([
            expense.id,
            expense.category,
            expense.amount,
            expense.description,
        ])

    table = Table(data)
    table.setStyle([("BACKGROUND", (0, 0), (-1, 0), colors.grey), ("GRID", (0, 0), (-1, -1), 1, colors.black)])
    doc.build([table])

    pdf_data = buffer.getvalue()
    buffer.close()

    return Response(
        pdf_data,
        mimetype="application/pdf",
        headers={"Content-Disposition": "attachment; filename=expenses_report.pdf"},
    )


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)