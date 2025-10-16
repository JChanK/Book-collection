# Диаграмма классов

## Глоссарий
| Термин | Определение |
|:--------|:-------------|
| **Class Diagram** | Диаграмма, показывающая классы системы, их атрибуты, методы и связи между ними. |
| **BookTracker** | Веб-приложение для управления коллекцией книг, просмотра каталога, поиска авторов и добавления рецензий. |
| **Entity** | Основной объект предметной области, отображаемый в базе данных. |
| **Service** | Класс бизнес-логики, управляющий работой сущностей и контроллеров. |
| **Controller** | Компонент, принимающий запросы из интерфейса и вызывающий соответствующие сервисы. |

---

## Содержание
1. [Классы предметной области](#domain)
2. [Классы сервисов](#services)
3. [Классы контроллеров](#controllers)
4. [Связи между классами](#relations)
5. [Диаграмма классов](#diagram)

---

<a name="domain"/>

## 1. Классы предметной области

| Класс | Описание | Основные поля | Методы |
|:------|:----------|:--------------|:--------|
| **User** | Зарегистрированный пользователь приложения. | id, email, passwordHash, displayName, registerDate | register(), login(), logout() |
| **Book** | Книга в каталоге. | id, title, isbn, year, description, coverUrl | getAverageRating(), addReview() |
| **Author** | Автор книги. | id, name, bio | getBooks(), addBook() |
| **Review** | Рецензия на книгу. | id, text, rating, createdAt, status | validate(), approve(), reject() |
| **CollectionEntry** | Запись книги в личной коллекции пользователя. | id, userId, bookId, status, notes, rating | updateStatus(), deleteEntry() |
| **Genre** | Жанр книги. | id, name | getBooks() |

---

<a name="services"/>

## 2. Классы сервисов

| Класс | Назначение | Методы |
|:-------|:-------------|:--------|
| **AuthService** | Аутентификация и регистрация пользователей. | registerUser(), loginUser(), logoutUser(), validateCredentials() |
| **BookService** | Управление каталогом книг и данными о книгах. | getBooks(), getBookDetails(), addBook(), updateBook() |
| **AuthorService** | Работа с данными авторов. | getAuthors(), getAuthorDetails(), addAuthor() |
| **CollectionService** | Управление личной коллекцией пользователя. | addToCollection(), editEntry(), removeEntry(), getUserCollection() |
| **ReviewService** | Работа с отзывами. | addReview(), approveReview(), getBookReviews() |
| **SearchService** | Поиск по каталогу и авторам. | searchBooks(), searchAuthors() |

---

<a name="controllers"/>

## 3. Классы контроллеров

| Класс | Назначение | Основные методы |
|:------|:------------|:----------------|
| **AuthController** | Управление регистрацией, входом и выходом пользователей. | POST /login, POST /register, POST /logout |
| **BookController** | Обработка запросов, связанных с книгами. | GET /books, GET /books/{id}, POST /books |
| **AuthorController** | Отображение страниц авторов и их данных. | GET /authors, GET /authors/{id} |
| **CollectionController** | Управление личной коллекцией пользователя. | GET /collections, POST /collections, PUT /collections/{id}, DELETE /collections/{id} |
| **ReviewController** | Обработка запросов, связанных с отзывами. | POST /books/{id}/reviews, GET /books/{id}/reviews |

---

<a name="relations"/>

## 4. Связи между классами

| Класс | Связан с | Тип связи |
|:-------|:-----------|:-----------|
| User | CollectionEntry | 1 — * |
| User | Review | 1 — * |
| Book | Author | * — * |
| Book | Review | 1 — * |
| Book | CollectionEntry | 1 — * |
| Author | Book | * — * |
| Genre | Book | * — * |

---

<a name="diagram"/>

## 5. Диаграмма классов

![Диаграмма классов — BookTracker](https://github.com/JChanK/Book-collection/blob/main/docs/Diagrams/images/class_diagram.png)

