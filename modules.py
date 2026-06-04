import os
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Lab 1: Student registration and grade evaluation
def evaluate_grade(marks):
    if marks >= 90: return 'A'
    elif marks >= 80: return 'B'
    elif marks >= 70: return 'C'
    elif marks >= 60: return 'D'
    else: return 'F'

# Lab 5: Fee calculation using functions
def calculate_fee(tuition, hostel=0, transport=0):
    return float(tuition) + float(hostel) + float(transport)

# Lab 6: File-based academic record management
def save_academic_record(filename, data):
    with open(filename, 'a') as f:
        f.write(data + "\n")

def read_academic_records(filename):
    if not os.path.exists(filename):
        return []
    records = []
    with open(filename, 'r') as f:
        for line in f:
            parts = line.strip().split(',')
            if len(parts) == 3:
                records.append({'id': parts[0], 'name': parts[1], 'marks': float(parts[2])})
    return records

def get_academic_stats(records):
    if not records:
        return {'total': 0, 'avg': 0, 'top_name': '-', 'top_id': '-', 'top_marks': 0}
    total = len(records)
    avg = sum(r['marks'] for r in records) / total
    top = max(records, key=lambda x: x['marks'])
    return {'total': total, 'avg': round(avg, 2), 'top_name': top['name'], 'top_id': top['id'], 'top_marks': top['marks']}

# Lab 7: Directory scanning with exception handling
def scan_directory(path):
    try:
        if not os.path.exists(path):
            raise FileNotFoundError(f"Directory '{path}' not found.")
        files = os.listdir(path)
        return True, files
    except Exception as e:
        return False, str(e)

# Lab 8: Student performance analytics using NumPy, Pandas, Matplotlib
def add_analytics_record(csv_file, record):
    df = pd.DataFrame([record])
    if not os.path.exists(csv_file):
        df.to_csv(csv_file, index=False)
    else:
        df.to_csv(csv_file, mode='a', header=False, index=False)

def get_analytics_data(csv_file):
    try:
        if not os.path.exists(csv_file):
            return False, {}, {}
        df = pd.read_csv(csv_file)
        if df.empty:
            return False, {}, {}

        df['Average'] = df[['Math', 'Science', 'English']].mean(axis=1)
        chart_data = {
            'names': df['Name'].tolist(),
            'averages': [round(float(a), 2) for a in df['Average'].tolist()]
        }

        top_stats = {
            'math': {'name': str(df.loc[df['Math'].idxmax(), 'Name']), 'marks': int(df['Math'].max())},
            'science': {'name': str(df.loc[df['Science'].idxmax(), 'Name']), 'marks': int(df['Science'].max())},
            'english': {'name': str(df.loc[df['English'].idxmax(), 'Name']), 'marks': int(df['English'].max())}
        }

        return True, chart_data, top_stats
    except Exception as e:
        return False, {}, {}
