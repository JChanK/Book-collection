package com.booktracker.service;

import com.booktracker.dto.AuthorDTO;
import com.booktracker.entity.Author;
import com.booktracker.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final ModelMapper modelMapper;

    public Page<AuthorDTO> getAllAuthors(Pageable pageable) {
        return authorRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    public AuthorDTO getAuthorById(Long id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + id));
        return convertToDTO(author);
    }

    public Page<AuthorDTO> searchAuthors(String query, Pageable pageable) {
        return authorRepository.findByNameContainingIgnoreCase(query, pageable)
                .map(this::convertToDTO);
    }

    private AuthorDTO convertToDTO(Author author) {
        return modelMapper.map(author, AuthorDTO.class);
    }
}