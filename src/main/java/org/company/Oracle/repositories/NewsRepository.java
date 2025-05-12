package org.company.Oracle.repositories;

import org.company.Oracle.models.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface NewsRepository extends JpaRepository<News, Long> {

    @Query("SELECT n FROM News n WHERE n.author.email = :email AND n.dateOfCreation >= :timeLimit")
    List<News> findRecentNewsByUser(@Param("email") String email, @Param("timeLimit")LocalDateTime timeLimit);
}
