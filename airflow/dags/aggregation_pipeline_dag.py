# airflow/dags/aggregation_pipeline_dag.py
from airflow.models.dag import DAG
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator
from datetime import datetime

with DAG(
    dag_id='01_summary_stats_aggregation',
    start_date=datetime(2025, 9, 15),
    schedule_interval='@daily',  # 매일 자정에 실행
    catchup=False,
    tags=['aggregation', 'pyspark'],
) as dag:
    
    # PySpark 스크립트를 실행하는 Spark Submit 작업을 정의
    aggregate_summary_monthly = SparkSubmitOperator(
        task_id='aggregate_summary_stats_monthly',
        application='/opt/spark/scripts/aggregate_summary_stats.py', # Docker 컨테이너 내부 경로
        conn_id='spark_default', # Airflow는 기본적으로 Spark Master를 찾도록 설정됨
        verbose=True
    )