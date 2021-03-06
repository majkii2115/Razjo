import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { IUserObj, Family } from './UserObjG';
import { User } from './User';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  apiUrl = 'https://razjoapi.herokuapp.com/api';
  public $reqObj: IUserObj;
  public $response;
  public families: Family[];
  constructor(private http: HttpClient) { }

  loginUser(user: User)
  {
    return this.http.post<IUserObj>(this.apiUrl + '/User/login', user);
  }

}
