# Dockerfile
FROM apache/airflow:2.9.2-python3.9

# airflow 유저로 pip 설치
USER airflow

RUN pip install --no-cache-dir \
    apache-airflow-providers-postgres \
    apache-airflow-providers-apache-spark
