import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { WaveServiceService } from '../services/wave-service.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private service : WaveServiceService, private rout: Router){
    
  }
  canActivate(){
    let user = JSON.parse(this.service.getCurrentUser());
    if(user){
    if(user.role=='Admin'){
      return true
    }else{
      this.rout.navigate(['/home'])
      return false
    }
   
  }else{
    this.rout.navigate(['/inicio'])
    return false
}
}
  
}