package com.booktracker.controller;

import com.booktracker.entity.UserList;
import com.booktracker.entity.Book;
import com.booktracker.entity.Author;
import com.booktracker.entity.User;
import com.booktracker.repository.UserListRepository;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.AuthorRepository;
import com.booktracker.repository.UserRepository;
import com.booktracker.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

//import javax.validation.Valid;
//import javax.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/user/lists")
public class UserListController {

        private final UserListRepository userListRepository;
        private final BookRepository bookRepository;
        private final AuthorRepository authorRepository;
        private final UserRepository userRepository;
        private final UserService userService;

        public UserListController(UserListRepository userListRepository,
                                  BookRepository bookRepository,
                                  AuthorRepository authorRepository,
                                  UserRepository userRepository,
                                  UserService userService) {
                this.userListRepository = userListRepository;
                this.bookRepository = bookRepository;
                this.authorRepository = authorRepository;
                this.userRepository = userRepository;
                this.userService = userService;
        }

        // Получить все списки текущего пользователя
        @GetMapping
        public ResponseEntity<List<UserList>> getUserLists(Authentication authentication) {
                String username = authentication.getName();
                User user = (User) userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                List<UserList> userLists = userListRepository.findByUser(user);

                // Добавляем системные списки если их нет
                if (userLists.stream().noneMatch(list -> "all".equals(list.getType()))) {
                        UserList allList = new UserList();
                        allList.setName("All");
                        allList.setType("system");
                        allList.setUser(user);
                        userListRepository.save(allList);
                        userLists.add(0, allList);
                }

                if (userLists.stream().noneMatch(list -> "favourite".equals(list.getType()))) {
                        UserList favouriteList = new UserList();
                        favouriteList.setName("Favourite");
                        favouriteList.setType("system");
                        favouriteList.setUser(user);
                        userListRepository.save(favouriteList);
                        userLists.add(1, favouriteList);
                }

                return ResponseEntity.ok(userLists);
        }

        // Создать новый список
        @PostMapping
        public ResponseEntity<UserList> createList(@RequestBody @Valid CreateListRequest request,
                                                   Authentication authentication) {
                String username = authentication.getName();
                User user = (User) userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                // Проверяем, нет ли уже списка с таким именем
                if (userListRepository.existsByUserAndName(user, request.getName())) {
                        return ResponseEntity.badRequest().build();
                }

                UserList userList = new UserList();
                userList.setName(request.getName());
                userList.setType("custom");
                userList.setUser(user);
                userList.setBooks(new HashSet<>());
                userList.setAuthors(new HashSet<>());

                UserList savedList = userListRepository.save(userList);
                return ResponseEntity.ok(savedList);
        }

        // Удалить список
        @DeleteMapping("/{listId}")
        public ResponseEntity<?> deleteList(@PathVariable Long listId, Authentication authentication) {
                String username = authentication.getName();
                User user = (User) userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                Optional<UserList> listOpt = userListRepository.findByIdAndUser(listId, user);
                if (listOpt.isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                UserList list = listOpt.get();
                // Не позволяем удалять системные списки
                if ("system".equals(list.getType())) {
                        return ResponseEntity.badRequest().body("Cannot delete system lists");
                }

                userListRepository.delete(list);
                return ResponseEntity.ok().build();
        }

        // Добавить книгу в список
        @PostMapping("/{listId}/books/{bookId}")
        public ResponseEntity<?> addBookToList(@PathVariable Long listId,
                                               @PathVariable Long bookId,
                                               Authentication authentication) {
                String username = authentication.getName();
                User user = (User) userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                Optional<UserList> listOpt = userListRepository.findByIdAndUser(listId, user);
                if (listOpt.isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                Optional<Book> bookOpt = bookRepository.findById(bookId);
                if (bookOpt.isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                UserList list = listOpt.get();
                Book book = bookOpt.get();

                list.getBooks().add(book);
                userListRepository.save(list);

                return ResponseEntity.ok().build();
        }

        // Удалить книгу из списка
        @DeleteMapping("/{listId}/books/{bookId}")
        public ResponseEntity<?> removeBookFromList(@PathVariable Long listId,
                                                    @PathVariable Long bookId,
                                                    Authentication authentication) {
                String username = authentication.getName();
                User user = (User) userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                Optional<UserList> listOpt = userListRepository.findByIdAndUser(listId, user);
                if (listOpt.isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                Optional<Book> bookOpt = bookRepository.findById(bookId);
                if (bookOpt.isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                UserList list = listOpt.get();
                Book book = bookOpt.get();

                list.getBooks().remove(book);
                userListRepository.save(list);

                return ResponseEntity.ok().build();
        }

        // Добавить автора в список
        @PostMapping("/{listId}/authors/{authorId}")
        public ResponseEntity<?> addAuthorToList(@PathVariable Long listId,
                                                 @PathVariable Long authorId,
                                                 Authentication authentication) {
                String username = authentication.getName();
                User user = (User) userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                Optional<UserList> listOpt = userListRepository.findByIdAndUser(listId, user);
                if (listOpt.isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                Optional<Author> authorOpt = authorRepository.findById(authorId);
                if (authorOpt.isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                UserList list = listOpt.get();
                Author author = authorOpt.get();

                list.getAuthors().add(author);
                userListRepository.save(list);

                return ResponseEntity.ok().build();
        }

        // Удалить автора из списка
        @DeleteMapping("/{listId}/authors/{authorId}")
        public ResponseEntity<?> removeAuthorFromList(@PathVariable Long listId,
                                                      @PathVariable Long authorId,
                                                      Authentication authentication) {
                String username = authentication.getName();
                User user = (User) userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                Optional<UserList> listOpt = userListRepository.findByIdAndUser(listId, user);
                if (listOpt.isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                Optional<Author> authorOpt = authorRepository.findById(authorId);
                if (authorOpt.isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                UserList list = listOpt.get();
                Author author = authorOpt.get();

                list.getAuthors().remove(author);
                userListRepository.save(list);

                return ResponseEntity.ok().build();
        }

        // Получить книги из списка
        @GetMapping("/{listId}/books")
        public ResponseEntity<Page<Book>> getBooksFromList(@PathVariable Long listId,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "20") int size,
                                                           @RequestParam(defaultValue = "title") String sort,
                                                           Authentication authentication) {
                String username = authentication.getName();
                User user = (User) userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                Optional<UserList> listOpt = userListRepository.findByIdAndUser(listId, user);
                if (listOpt.isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                UserList list = listOpt.get();

                // Для системного списка "all" возвращаем все книги пользователя
                if ("all".equals(list.getType())) {
                        // Здесь можно вернуть все книги или книги из коллекции пользователя
                        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
                        Page<Book> allBooks = bookRepository.findAll(pageable);
                        return ResponseEntity.ok(allBooks);
                }

                // Для обычных списков возвращаем книги из списка
                Set<Book> books = list.getBooks();
                List<Book> bookList = books.stream().toList();

                // Простая пагинация
                int start = page * size;
                int end = Math.min(start + size, bookList.size());

                if (start > bookList.size()) {
                        return ResponseEntity.ok(Page.empty());
                }

                List<Book> pageContent = bookList.subList(start, end);
                Page<Book> resultPage = new org.springframework.data.domain.PageImpl<>(
                        pageContent,
                        PageRequest.of(page, size, Sort.by(sort)),
                        bookList.size()
                );

                return ResponseEntity.ok(resultPage);
        }

        // Получить авторов из списка
        @GetMapping("/{listId}/authors")
        public ResponseEntity<Page<Author>> getAuthorsFromList(@PathVariable Long listId,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "20") int size,
                                                               @RequestParam(defaultValue = "name") String sort,
                                                               Authentication authentication) {
                String username = authentication.getName();
                User user = (User) userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                Optional<UserList> listOpt = userListRepository.findByIdAndUser(listId, user);
                if (listOpt.isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                UserList list = listOpt.get();
                Set<Author> authors = list.getAuthors();
                List<Author> authorList = authors.stream().toList();

                // Простая пагинация
                int start = page * size;
                int end = Math.min(start + size, authorList.size());

                if (start > authorList.size()) {
                        return ResponseEntity.ok(Page.empty());
                }

                List<Author> pageContent = authorList.subList(start, end);
                Page<Author> resultPage = new org.springframework.data.domain.PageImpl<>(
                        pageContent,
                        PageRequest.of(page, size, Sort.by(sort)),
                        authorList.size()
                );

                return ResponseEntity.ok(resultPage);
        }

        @Data
        public static class CreateListRequest {
                @NotBlank
                private String name;
        }
}