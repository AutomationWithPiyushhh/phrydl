package com.phrydlpg.core.auth.controller;

import com.phrydlpg.core.auth.entity.RefreshToken;
import com.phrydlpg.core.auth.security.JwtUtils;
import com.phrydlpg.core.auth.security.UserDetailsImpl;
import com.phrydlpg.core.auth.service.RefreshTokenService;
import com.phrydlpg.core.common.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ApiResponse<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        JwtResponse response = new JwtResponse(
                jwt,
                refreshToken.getToken(),
                userDetails.getId().toString(),
                userDetails.getUsername(),
                userDetails.getAuthorities().iterator().next().getAuthority()
        );

        return ApiResponse.success("Login successful", response);
    }

    @GetMapping("/me")
    public ApiResponse<JwtResponse> getMe() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return ApiResponse.error("Not authenticated");
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        JwtResponse response = new JwtResponse(
                null,
                null,
                userDetails.getId().toString(),
                userDetails.getUsername(),
                userDetails.getAuthorities().iterator().next().getAuthority()
        );
        
        return ApiResponse.success("Current user retrieved", response);
    }

    @PostMapping("/refresh")
    public ApiResponse<JwtResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateTokenFromUsername(user.getEmail(), user.getRole().name());
                    return ApiResponse.success("Token refreshed successfully", new JwtResponse(
                            token,
                            requestRefreshToken,
                            user.getId().toString(),
                            user.getEmail(),
                            "ROLE_" + user.getRole().name()
                    ));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }
}

@Data
class LoginRequest {
    @NotBlank
    private String email;
    @NotBlank
    private String password;
}

@Data
class TokenRefreshRequest {
    @NotBlank
    private String refreshToken;
}

@Data
class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String refreshToken;
    private String id;
    private String email;
    private String role;

    public JwtResponse(String token, String refreshToken, String id, String email, String role) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.id = id;
        this.email = email;
        this.role = role;
    }
}
