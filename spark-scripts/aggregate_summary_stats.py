# spark-scripts/aggregate_summary_stats.py
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit, trunc, sum as _sum, count, avg, countDistinct, current_timestamp, expr

def run_aggregation(period_type="monthly"):
    """
    기간별 요약 통계를 집계하는 PySpark 함수
    """
    spark = SparkSession.builder \
        .appName(f"Aggregate Summary Stats - {period_type}") \
        .getOrCreate()

    print(f"Starting {period_type} summary stats aggregation...")

    # --- 1. ClickHouse에서 원본 데이터 읽기 ---
    orders_df = spark.read \
        .format("jdbc") \
        .option("driver", "com.clickhouse.jdbc.ClickHouseDriver") \
        .option("url", "jdbc:clickhouse://clickhouse-server:8123/default") \
        .option("user", "default") \
        .option("password", "") \
        .option("dbtable", "orders") \
        .load()

    # --- 2. 데이터 변환 및 집계 ---
    if period_type == "daily":
        date_func = trunc(col("ordered_at"), "DD")
        interval_days = 7
    elif period_type == "weekly":
        # Spark에는 toStartOfWeek가 없으므로 date_trunc로 유사하게 구현
        date_func = trunc(col("ordered_at"), "WEEK")
        interval_days = 30
    elif period_type == "monthly":
        date_func = trunc(col("ordered_at"), "MM")
        interval_days = 90
    elif period_type == "yearly":
        date_func = trunc(col("ordered_at"), "YEAR")
        interval_days = 730
    else:
        spark.stop()
        raise ValueError(f"Unsupported period_type: {period_type}")

    filtered_orders = orders_df.filter(col("ordered_at") >= (current_timestamp() - expr(f"INTERVAL {interval_days} DAYS")))

    summary_agg = filtered_orders \
        .withColumn("period_start", date_func) \
        .groupBy("store_id", "period_start") \
        .agg(
            _sum("total_price").alias("total_sales"),
            count("*").alias("total_orders"),
            avg("total_price").alias("avg_order_value"),
            countDistinct("user_id").alias("unique_visitors")
        )

    final_df = summary_agg \
        .withColumn("period_type", lit(period_type)) \
        .withColumn("created_at", current_timestamp()) \
        .select(
            "period_type", "period_start", "store_id", "total_sales",
            "total_orders", "avg_order_value", "unique_visitors", "created_at"
        )

    # --- 3. 집계된 결과를 ClickHouse에 다시 쓰기 ---
    final_df.write \
        .format("jdbc") \
        .option("driver", "com.clickhouse.jdbc.ClickHouseDriver") \
        .option("url", "jdbc:clickhouse://clickhouse-server:8123/default") \
        .option("user", "default") \
        .option("password", "") \
        .option("dbtable", "summary_stats_by_period") \
        .mode("append") \
        .save()

    spark.stop()
    print(f"{period_type} summary stats aggregation completed successfully.")

if __name__ == "__main__":
    # 이 스크립트를 직접 실행할 때 월간 집계를 기본으로 수행
    run_aggregation("monthly")