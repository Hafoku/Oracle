package org.company.Oracle.services;

import org.company.Oracle.models.Cart;
import org.company.Oracle.models.CartItem;
import org.company.Oracle.models.Product;
import org.company.Oracle.models.User;
import org.company.Oracle.repositories.CartItemRepository;
import org.company.Oracle.repositories.CartRepository;
import org.company.Oracle.repositories.ProductRepository;
import org.company.Oracle.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    private static final Logger logger = LoggerFactory.getLogger(CartService.class);

    public Cart addItemToCart(Long productId, int quantity){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName());
        if (user != null){
            logger.info("Пользователь {} найден", user.getEmail());
            Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Продукт не найден"));
            Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
                Cart newCart = new Cart();
                newCart.setUser(user);
                newCart.setProducts(new ArrayList<>());
                logger.info("Корзина не найдена, была создана новая корзина");
                return cartRepository.save(newCart);
            });
            Optional<CartItem> existingProduct = cart.getProducts().stream().filter(item -> item.getProduct().equals(product))
            .findFirst();

            if (existingProduct.isPresent()){
                existingProduct.get().setQuantity(existingProduct.get().getQuantity() + quantity);
                logger.info("Продукт уже существует, увеличивается его количевство. Теперь '{}' {} штук в корзине", product.getName(), existingProduct.get().getQuantity());
            } else {
                CartItem cartItem = CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .quantity(quantity)
                        .build();
                cart.getProducts().add(cartItem);
                logger.info("Продукт {} успешно добавлен в корзину. Его количество: {}", product.getName(), cartItem.getQuantity());
            }
            return cartRepository.save(cart);
        }
        else {
            throw new UsernameNotFoundException("Пользователь не был найден.");
        }

    }

    public CartItem addQuantity(Long cartItemId, int quantity) throws Throwable {
        CartItem cartItem = cartItemRepository.findById(cartItemId).orElseThrow(() -> new RuntimeException("Товар не найден"));
        cartItem.setQuantity(cartItem.getQuantity() + quantity);
        logger.info("Товар {} обновил количество товара, теперь его количество: {}", cartItem.getProduct().getName(), cartItem.getQuantity());
        return cartItemRepository.save(cartItem);
    }

    public void deleteItem(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId).orElseThrow(() -> new RuntimeException("Товар не найден"));
        cartItemRepository.delete(cartItem);
    }
}
