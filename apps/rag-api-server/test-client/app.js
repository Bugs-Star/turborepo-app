document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("query-form");
  const input = document.getElementById("question-input");
  const submitButton = document.getElementById("submit-button");
  const loadingIndicator = document.getElementById("loading-indicator");
  const answerDiv = document.getElementById("answer");
  const sourcesDiv = document.getElementById("sources");

  const RAG_API_ENDPOINT = "http://localhost:8000/query";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    // UI 상태 변경: 로딩 시작
    submitButton.disabled = true;
    submitButton.textContent = "생성 중...";
    loadingIndicator.classList.remove("hidden");
    answerDiv.innerHTML = "";
    sourcesDiv.innerHTML =
      '<p class="text-sm text-gray-400">답변의 근거가 된 데이터가 여기에 표시됩니다.</p>';

    try {
      const response = await fetch(RAG_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "API 서버에서 오류가 발생했습니다."
        );
      }

      const data = await response.json();

      // 결과 표시
      answerDiv.textContent = data.answer;
      displaySources(data.source_documents);
    } catch (error) {
      console.error("Error fetching RAG API:", error);
      answerDiv.textContent = `오류가 발생했습니다: ${error.message}`;
    } finally {
      // UI 상태 변경: 로딩 종료
      submitButton.disabled = false;
      submitButton.textContent = "질문하기";
      loadingIndicator.classList.add("hidden");
    }
  });

  function displaySources(documents) {
    if (!documents || documents.length === 0) {
      sourcesDiv.innerHTML =
        '<p class="text-sm text-gray-400">근거 데이터를 찾을 수 없습니다.</p>';
      return;
    }

    sourcesDiv.innerHTML = ""; // 기존 내용 초기화
    documents.forEach((doc) => {
      const docElement = document.createElement("div");
      docElement.className = "source-doc";

      // page_content를 예쁘게 표시
      const content = doc.page_content || "내용 없음";
      docElement.textContent = content;

      sourcesDiv.appendChild(docElement);
    });
  }
});
