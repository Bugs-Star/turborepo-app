# app/rag/loader.py

from typing import List
from langchain_core.documents import Document
import clickhouse_connect
from app import config

# ⭐️ URL을 파싱하기 위한 라이브러리를 import 합니다.
from urllib.parse import urlparse

def load_documents_from_clickhouse() -> List[Document]:
    """
    clickhouse-connect를 직접 사용해 RAG 성능에 최적화된 방식으로 문서를 로드합니다.
    """
    print(f"'{config.CLICKHOUSE_HOST}'의 ClickHouse('{config.CLICKHOUSE_TABLE}' 테이블)에서 문서 로딩 중...")

    try:
        # ⭐️ config에서 가져온 전체 URL을 파싱합니다.
        parsed_url = urlparse(config.CLICKHOUSE_HOST)
        
        # ⭐️ 파싱된 객체에서 hostname, port를 추출합니다.
        #    secure 옵션은 URL이 'https'로 시작하는지 여부에 따라 결정됩니다.
        client = clickhouse_connect.get_client(
            host=parsed_url.hostname,
            port=parsed_url.port,
            username=config.CLICKHOUSE_USERNAME,
            password=config.CLICKHOUSE_PASSWORD,
            database=config.CLICKHOUSE_DATABASE,
            secure=(parsed_url.scheme == 'https')
        )
        print("  - ✅ ClickHouse 클라이언트 생성 및 연결 성공!")

        query = f"SELECT * FROM {config.CLICKHOUSE_TABLE} LIMIT 1000"
        print(f"  - 실행할 쿼리: {query}")
        
        # ... (이하 코드는 동일) ...
        query_results = client.query(query).named_results()

        documents = []
        for row in query_results:
            page_content = (
                f"'{row.get('store_id')}' 매장의 '{row.get('period_start')}'부터 시작하는 "
                f"'{row.get('period_type')}' 데이터 요약 보고서입니다.\n"
                f" - 기본 실적: 총 판매액은 {row.get('total_sales', 0)}원, 총 주문 수는 {row.get('total_orders', 0)}건, "
                f"평균 주문액은 {row.get('avg_order_value', 0)}원이며, 순 방문자 수는 {row.get('unique_visitors', 0)}명입니다.\n"
                f" - 인기 메뉴 Top3: 1위는 '{row.get('top_1_menu_id', '없음')}'({row.get('top_1_order_count', 0)}개), "
                f"2위는 '{row.get('top_2_menu_id', '없음')}'({row.get('top_2_order_count', 0)}개), "
                f"3위는 '{row.get('top_3_menu_id', '없음')}'({row.get('top_3_order_count', 0)}개) 입니다.\n"
                f" - 주요 고객 행동: 가장 많은 고객({row.get('top_1_path_users', 0)}명)이 이용한 경로는 {row.get('top_1_path', '없음')} 입니다."
            )
            metadata = {key: str(value) for key, value in row.items()}
            documents.append(Document(page_content=page_content, metadata=metadata))

        if not documents:
            print("경고: ClickHouse에서 문서를 가져오지 못했거나 테이블이 비어있습니다.")
            return []
        
        print(f"완료: 총 {len(documents)}개의 레코드를 로드했습니다.")
        return documents

    except Exception as e:
        print(f"오류: ClickHouse 연결 또는 데이터 처리 중 실패했습니다 - {e}")
        return []