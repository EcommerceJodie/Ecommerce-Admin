import { UserResponse } from './api/auth.service';
import { authApiService } from './api/auth.service';


interface StoredUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}


class AuthStoreService {
  private readonly TOKEN_KEY = 'token';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'adminUser';
  private readonly EMAIL_KEY = 'adminEmail';
  private refreshTokenRequest: Promise<void> | null = null;


  public isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!token && !!user;
  }
  

  public getCurrentUser(): StoredUser | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (userStr) {
        return JSON.parse(userStr) as StoredUser;
      }
      return null;
    } catch (error) {
      this.clearLocalStorageData();
      return null;
    }
  }
  
 
  public saveUserData(response: UserResponse, rememberMe?: boolean): void {
    this.setToken(response.token);
    this.setRefreshToken(response.refreshToken);
    
    if (rememberMe) {
      this.setRememberedEmail(response.email);
    } else {
      this.clearRememberedEmail();
    }
    
    this.setUserData({
      id: response.id,
      email: response.email,
      firstName: response.firstName, 
      lastName: response.lastName,
      roles: response.roles
    });
  }
  

  public isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes('Admin') : false;
  }


  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }
  

  private setUserData(user: StoredUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
  

  private setRememberedEmail(email: string): void {
    localStorage.setItem(this.EMAIL_KEY, email);
  }
  

  private clearRememberedEmail(): void {
    localStorage.removeItem(this.EMAIL_KEY);
  }
  

  public getRememberedEmail(): string {
    return localStorage.getItem(this.EMAIL_KEY) || '';
  }
  

  private clearLocalStorageData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  public async refreshAccessToken(): Promise<boolean> {
    // Tránh nhiều yêu cầu refresh token cùng lúc
    if (this.refreshTokenRequest) {
      await this.refreshTokenRequest;
      return this.isAuthenticated();
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const refreshPromise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await authApiService.refreshToken(refreshToken);
        this.saveUserData(response);
        resolve();
      } catch (error) {
        console.error('Refresh token error:', error);
        this.clearLocalStorageData();
        reject(error);
      } finally {
        this.refreshTokenRequest = null;
      }
    });

    this.refreshTokenRequest = refreshPromise;
    
    try {
      await refreshPromise;
      return true;
    } catch {
      return false;
    }
  }

  public async logout(): Promise<void> {
    try {
      if (this.isAuthenticated()) {
        await authApiService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearLocalStorageData();
    }
  }
}

export const authStoreService = new AuthStoreService(); 