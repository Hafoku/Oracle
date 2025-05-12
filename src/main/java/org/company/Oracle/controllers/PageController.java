package org.company.Oracle.controllers;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/")
@RestController
public class PageController {

    @GetMapping("/")
    public String getmainPage() {
        return "main"; // main.html в папке src/main/resources/templates/
    }

    @PostMapping("/")
    public String mainPage() {
        return "main"; // main.html в папке src/main/resources/templates/
    }

    @GetMapping("/force-logout")
    public String forceLogout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
        logoutHandler.logout(request, response, SecurityContextHolder.getContext().getAuthentication());
        return "redirect:/login";
    }

    @GetMapping("/about")
    public String aboutPage() {
        return "AboutUs";
    }

    @GetMapping("/services")
    public String servicesPage() {
        return "Services";
    }

    @GetMapping("/projects")
    public String projectsPage() {
        return "Projects";
    }
}

