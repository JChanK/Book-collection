# Диаграмма компонентов

## Глоссарий
| Термин | Определение |
|:------|:-------------|
| **Component Diagram** | Диаграмма, показывающая структурные компоненты системы и зависимости между ними. |
| **Артефакт (Artifact)** | Внутренний файл или модуль (WAR, JAR, скрипт и т.д.), отображаемый на компонент. |
| **BookTracker** | Веб-приложение для управления коллекцией книг, поиска и работы с рецензиями. |

---

## Содержание
1. [Компоненты системы](#components)  
2. [Артефакты и их размещение](#artifacts)  
3. [Диаграмма компонентов](#diagram)  

---

<a name="components"/>

## 1. Компоненты системы

| Компонент | Описание |
|:----------|:----------|
| **Web UI / Frontend** | Клиентская часть (HTML/JS/CSS), взаимодействующая с REST API. |
| **Auth API** | Компонент, отвечающий за регистрацию, вход, проверку сессий. |
| **Book API** | Компонент, обрабатывающий запросы, связанные с книгами: каталог, детали, CRUD. |
| **Author API** | Компонент, отвечающий за данные авторов. |
| **Collection API** | Управление личной коллекцией пользователя. |
| **Review API** | Обработка создания и получения рецензий. |
| **Search API** | Поисковый компонент, агрегирующий результаты по книгам и авторам. |
| **Database** | Хранилище данных (таблицы пользователей, книг, авторов, рецензий и др.). |
| **External Book Service** | Внешний компонент (API), откуда подгружаются подробности книг / обложки. |

---

<a name="artifacts"/>

## 2. Артефакты и их размещение

| Артефакт | Отображается на компоненте |
|:----------|:----------------------------|
| `frontend.war` / `static` | Web UI / Frontend |
| `auth-service.jar` | Auth API |
| `book-service.jar` | Book API |
| `author-service.jar` | Author API |
| `collection-service.jar` | Collection API |
| `review-service.jar` | Review API |
| `search-service.jar` | Search API |
| `database` (SQL схемы, дампы) | Database |
| `external-book-client.jar` | External Book Service |

---

<a name="diagram"/>

## 3. Диаграмма компонентов (PlantUML)

**Изображение:**  
![Диаграмма компонентов — BookTracker](https://github.com/JChanK/Book-collection/blob/main/docs/Diagrams/images/components_diagram.png)