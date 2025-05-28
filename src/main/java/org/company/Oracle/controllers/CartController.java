package org.company.Oracle.controllers;

import org.company.Oracle.models.Cart;
import org.company.Oracle.models.CartItem;
import org.company.Oracle.models.User;
import org.company.Oracle.repositories.CartRepository;
import org.company.Oracle.repositories.UserRepository;
import org.company.Oracle.services.CartService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(CartService.class);

    @GetMapping("/cart")
    public ResponseEntity<Optional<Cart>> showItemsInCart(){
        logger.info("Запрос на отоброжение корзины");
        User user = userRepository.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName());
        Optional<Cart> cart = cartRepository.findByUser(user);
        return ResponseEntity.ok().body(cart);
    }

    @PostMapping("/cart/add")
    public ResponseEntity<?> addItemToCart(@RequestParam Long productId,
                                           @RequestParam int quantity
    ){
        cartService.addItemToCart(productId, quantity);
        return ResponseEntity.ok().body("Товар успешно добавлен в корзину?");
    }

    @PutMapping("/cart/items/{id}")
    public ResponseEntity<CartItem> addQuantity(@PathVariable("id") Long cartItemId, @RequestBody int quantity) throws Throwable {
        logger.info("Товар обновляется на {}", quantity);
        CartItem cartItem = cartService.addQuantity(cartItemId, quantity);
        return ResponseEntity.ok().body(cartItem);
    }

    @DeleteMapping("/cart/items/{id}")
    public void deleteItem(@PathVariable("id") Long cartItemId){
        cartService.deleteItem(cartItemId);
    }
}
