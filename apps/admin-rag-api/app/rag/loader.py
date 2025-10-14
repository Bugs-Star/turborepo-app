# app/rag/loader.py
from typing import List
from langchain_core.documents import Document
import clickhouse_connect
from app import config
from urllib.parse import urlparse
from pymongo import MongoClient

# -----------------------------
# ClickHouse 문서 로딩
# -----------------------------
def load_documents_from_clickhouse(limit: int = 1000) -> List[Document]:
    """
    clickhouse-connect를 사용해 ClickHouse에서 문서를 로드합니다.
    """
    print(f"'{config.CLICKHOUSE_HOST}'의 ClickHouse('{config.CLICKHOUSE_TABLE}' 테이블)에서 문서 로딩 중...")

    try:
        parsed_url = urlparse(config.CLICKHOUSE_HOST)

        client = clickhouse_connect.get_client(
            host=parsed_url.hostname,
            port=config.CLICKHOUSE_PORT or parsed_url.port,
            username=config.CLICKHOUSE_USERNAME,
            password=config.CLICKHOUSE_PASSWORD,
            database=config.CLICKHOUSE_DATABASE,
            secure=(parsed_url.scheme == 'https')
        )
        print("  - ✅ ClickHouse 클라이언트 생성 및 연결 성공!")

        query = f"SELECT * FROM {config.CLICKHOUSE_TABLE} LIMIT {limit}"
        print(f"  - 실행할 쿼리: {query}")

        results = client.query(query).named_results()
        documents = []
        for row in results:
            page_content = (
                f"'{row.get('store_id')}' 매장의 '{row.get('period_start')}'부터 시작하는 "
                f"'{row.get('period_type')}' 데이터 요약 보고서입니다.\n"
                f" - 기본 실적: 총 판매액 {row.get('total_sales', 0)}원, 총 주문 수 {row.get('total_orders', 0)}건, "
                f"평균 주문액 {row.get('avg_order_value', 0)}원, 순 방문자 {row.get('unique_visitors', 0)}명\n"
                f" - 인기 메뉴 Top3: 1위 '{row.get('top_1_menu_id', '없음')}', 2위 '{row.get('top_2_menu_id', '없음')}', "
                f"3위 '{row.get('top_3_menu_id', '없음')}'\n"
                f" - 주요 고객 행동: 가장 많은 고객({row.get('top_1_path_users', 0)}명)이 이용한 경로 {row.get('top_1_path', '없음')}"
            )
            metadata = {key: str(value) for key, value in row.items()}
            documents.append(Document(page_content=page_content, metadata=metadata))

        print(f"완료: 총 {len(documents)}개의 레코드를 로드했습니다.")
        return documents

    except Exception as e:
        print(f"오류: ClickHouse 연결 또는 데이터 처리 실패 - {e}")
        return []
