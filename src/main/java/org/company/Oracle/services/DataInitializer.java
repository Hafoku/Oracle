package org.company.Oracle.services;

import org.company.Oracle.models.Role;
import org.company.Oracle.models.User;
import org.company.Oracle.repositories.RoleRepository;
import org.company.Oracle.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;
import java.util.logging.Logger;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(DataInitializer.class.getName());

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JdbcTemplate jdbcTemplate) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("=== DataInitializer start ===");

        // 1. Создаём БД OracleDB в PostgreSQL, если она не существует
        String dbName = "OracleDB";
        String checkDbQuery = "SELECT 1 FROM pg_database WHERE datname = ?";
        Integer count = jdbcTemplate.queryForObject(checkDbQuery, new Object[]{dbName}, Integer.class);
        boolean dbExists = (count != null);

        if (!dbExists) {
            jdbcTemplate.execute("CREATE DATABASE \"" + dbName + "\"");
            logger.info("База данных " + dbName + " создана.");
        } else {
            logger.info("База данных " + dbName + " уже существует.");
        }


        // 2. Создаём роли, если их нет
        if (roleRepository.count() == 0) {
            Role userRole = new Role(null, "USER");
            Role modRole = new Role(null, "MODERATOR");
            Role adminRole = new Role(null, "ADMIN");

            roleRepository.saveAll(Arrays.asList(userRole, modRole, adminRole));
            logger.info("Роли созданы: USER, MODERATOR, ADMIN");
        } else {
            logger.info("Роли уже существуют");
        }

        // 3. Создаём admin-пользователя, если его нет
        if (userRepository.findByEmail("admin@admin.com") == null) {
            Optional<Role> adminRoleOptional = roleRepository.findByName("ADMIN");
            Role adminRole = adminRoleOptional.orElseGet(() -> {
                Role newRole = new Role(null, "ADMIN");
                logger.info("Роль ADMIN не найдена, создаём новую");
                return roleRepository.save(newRole);
            });

            User admin = new User();
            admin.setName("admin");
            admin.setEmail("admin@admin.com");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRole(adminRole);

            userRepository.save(admin);
            logger.info("Пользователь admin создан: admin@admin.com / admin");
        } else {
            logger.info("Пользователь admin уже существует");
        }


        logger.info("=== DataInitializer завершил работу ===");
    }
}