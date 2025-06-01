package org.company.Oracle.config;

import org.company.Oracle.exceptions.UserAuthenticationEntryPoint;
import org.company.Oracle.filter.JwtFilter;
import org.company.Oracle.services.MyUserDetailsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
    private final MyUserDetailsService userDetailsService;

    @Autowired
    private JwtFilter jwtFilter;

    public SecurityConfig(MyUserDetailsService userDetailsService, UserAuthenticationEntryPoint userAuthenticationEntryPoint) {
        this.userDetailsService = userDetailsService;
        this.userAuthenticationEntryPoint = userAuthenticationEntryPoint;
    }

    private final UserAuthenticationEntryPoint userAuthenticationEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(userAuthenticationEntryPoint)
                )
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/messages", "/", "/user/login", "/user/logout", "/user/registration",
                                "/uploads/**", "/auth/**").permitAll()

                        .requestMatchers("/css/**", "/js/**", "/images/**", "/webjars/**").permitAll()

                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        .requestMatchers("/user/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/user/login/done").permitAll()

                        .requestMatchers("/news").authenticated()

                        // 🔒 ограничиваем доступ к истории чата
                        .requestMatchers("/chat/history", "/chat/save").authenticated()

                        .anyRequest().permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/user/logout")
                        .logoutSuccessUrl("/user/login?logout=true")
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                        .logoutSuccessHandler((request, response, authentication) -> {
                            if (authentication != null) {
                                logger.info("Пользователь {} вышел из системы", authentication.getName());
                            } else {
                                logger.info("Анонимный пользователь завершил сессию");
                            }
                            response.sendRedirect("/user/login?logout=true");
                        })
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);


        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
}
