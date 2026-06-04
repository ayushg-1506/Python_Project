from flask import Flask, render_template, request, jsonify
import os
import modules

app = Flask(__name__)
app.config['SECRET_KEY'] = 'smart_campus_secret_key'

# In-memory storage for student registration
students = []
student_id_counter = 101

# Ensure data directories exist
os.makedirs('data', exist_ok=True)
os.makedirs('static', exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

# Lab 1: Student Registration
@app.route('/register', methods=['POST'])
def register():
    global student_id_counter
    data = request.json
    name = data.get('name')
    marks = float(data.get('marks', 0))
    grade = modules.evaluate_grade(marks)
    student = {
        'id': student_id_counter,
        'name': name,
        'marks': marks,
        'grade': grade
    }
    students.append(student)
    student_id_counter += 1
    return jsonify({'success': True, 'student': student, 'message': f'Student {name} registered with Grade {grade}'})

# Lab 5: Fee Calculator
@app.route('/calculate_fee', methods=['POST'])
def calc_fee():
    data = request.json
    tuition = data.get('tuition', 0)
    hostel = data.get('hostel', 0)
    transport = data.get('transport', 0)
    total = modules.calculate_fee(tuition, hostel, transport)
    return jsonify({'success': True, 'total': total})

# Lab 6: Academic Records (File-based)
@app.route('/academic/add', methods=['POST'])
def add_academic():
    data = request.json
    sid = data.get('id')
    name = data.get('name')
    marks = data.get('marks')
    record_line = f"{sid},{name},{marks}"
    modules.save_academic_record('data/academic_records.txt', record_line)
    return jsonify({'success': True})

@app.route('/academic/records', methods=['GET'])
def get_academic():
    records = modules.read_academic_records('data/academic_records.txt')
    stats = modules.get_academic_stats(records)
    return jsonify({'success': True, 'records': records, 'stats': stats})

# Lab 7: Directory Scanner
@app.route('/scan_dir', methods=['GET'])
def scan_dir():
    path = request.args.get('path', '.')
    success, result = modules.scan_directory(path)
    return jsonify({'success': success, 'result': result})

# Lab 8: Performance Analytics
@app.route('/analytics/add', methods=['POST'])
def add_analytics():
    data = request.json
    modules.add_analytics_record('data/student_performance.csv', data)
    return jsonify({'success': True})

@app.route('/analytics/data', methods=['GET'])
def get_analytics():
    success, chart_data, top_stats = modules.get_analytics_data('data/student_performance.csv')
    return jsonify({'success': success, 'chart_data': chart_data, 'top': top_stats})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
