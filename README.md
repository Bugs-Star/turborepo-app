
## 0. TurboRepo에 대해서

TurboRepo는 모노레포(Monorepo)의 특성상, 모든 패키지를 **루트(Root) 디렉토리**에서 관리합니다. 

> **❗️주의❗️ : 개별 워크스페이스(웹, API 등)에서 패키지를 설치하면 안 됨**

### 처음 설치
```bash
pnpm install
```

### 개발용 서버 실행
```bash
pnpm dev
```

서버 4개가 동시에 실행 됩니다. 방향키로 이동해서 각 서버의 로그들을 확인 할 수 있습니다.

<br />


## 1. 패키지 설치 및 관리

**워크스페이스(Workspace)** 는 모노레포(Monorepo) 내에서 관리되는 개별적인 프로젝트 단위입니다.

하나의 Git 저장소(Monorepo) 안에 여러 개의 독립된 프로젝트(예: web, api, admin, worker)가 존재할 때, 이 각각의 프로젝트를 워크스페이스라고 부릅니다.

쉽게 말해, 전체 프로젝트가 하나의 큰 건물이라면, 그 안에 있는 web, api, admin 같은 프로젝트들은 각각 독립된 방 역할을 하는 셈이죠.

  * **새로운 패키지 설치:**

    새로운 패키지(`lodash` 등)를 설치할 때는 프로젝트의 루트 디렉토리에서 다음 명령어를 사용해야 합니다. `--filter` 옵션을 사용하면 특정 워크스페이스에만 패키지를 설치할 수 있어요.

    ```bash
    pnpm add lodash --filter=web
    ```

    만약 모든 워크스페이스에서 공통으로 사용하는 패키지라면, 아래와 같이 `--workspace` 옵션을 사용해 `dependencies`에 설치해야 합니다.

    ```bash
    pnpm add dayjs --workspace
    ```

  * **패키지 삭제:**

    패키지를 삭제할 때도 마찬가지로 루트 디렉토리에서 `--filter` 옵션을 사용합니다.

    ```bash
    pnpm remove lodash --filter=web
    ```

  * **패키지 업데이트:**

    모든 패키지를 한 번에 업데이트할 때는 루트 디렉토리에서 `pnpm update`를 사용합니다.




## 2. 스크립트(서버) 실행

TurboRepo의 가장 큰 장점 중 하나는 **한 번의 명령어로 여러 워크스페이스의 스크립트를 동시에 실행**할 수 있다는 점이에요. `turbo run` 명령어를 사용하면 됩니다.

  * **모든 워크스페이스 서버 실행:**

    `web`, `api`, `admin`, `worker` 등 모든 워크스페이스의 개발 서버를 동시에 실행하고 싶을 때 사용합니다.

    ```bash
    turbo run dev
    ```

  * **특정 워크스페이스 서버 실행:**

    담당하고 있는 워크스페이스(`web` 등)의 서버만 실행하고 싶을 때는 `--filter` 옵션을 사용합니다.

    ```bash
    turbo run dev --filter=web
    ```

    2개의 워크스페이스 서버를 실행 할 때

    ```bash
    turbo run dev --filter={web,admin}
    ```

  * **의존성 실행:**

    만약 `web`이 `api`를 필요로 한다면, `web`만 실행해도 `api` 서버가 자동으로 먼저 실행됩니다. `dependsOn` 설정을 통해 의존성을 관리할 수 있어요.

    ```json
    // turbo.json
    "pipeline": {
      "dev": {
        "dependsOn": ["^dev"]
      }
    }
    ```




## 3. 캐싱(Caching) 활용

TurboRepo는 빌드나 테스트 결과를 **캐싱**하여, 변경되지 않은 작업은 다시 실행하지 않고 이전에 저장된 결과를 재사용합니다. 이는 빌드 시간을 획기적으로 줄여주는 매우 중요한 기능입니다.

  * **캐싱의 이해:**

      * TurboRepo는 **`터보.json`(`turbo.json`)** 파일에 정의된 대로 파일 변경 사항을 감지하여 캐시를 생성하고 재사용합니다.
      * `build`, `test`, `lint` 등 반복되는 작업에서 캐싱 효과가 가장 크게 나타납니다.

  * **캐시 확인:**

    명령어를 실행했을 때 `Full`이 아닌 `Cached`로 표시된다면, 캐시가 적용된 것입니다.

    ```bash
    > turbo run build
    ...
    ✔ web:build:cache [650ms]
    ✔ api:build:cache [420ms]
    ```
