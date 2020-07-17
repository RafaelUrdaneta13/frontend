import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
  FormBuilder,
  FormArray,
  RequiredValidator,
  AbstractControl,
} from '@angular/forms';
import { WaveServiceService } from 'src/app/services/wave-service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(
      control &&
      control.parent &&
      control.parent.invalid &&
      control.parent.dirty
    );

    return invalidCtrl || invalidParent;
  }
}


@Component({
  selector: 'app-registrar-admin',
  templateUrl: './registrar-admin.component.html',
  styleUrls: ['./registrar-admin.component.scss']
})
export class RegistrarAdminComponent implements OnInit {
  private emailPattern: any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  private passwordPattern: any = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]/;
  private onlyletters: any= /^[ñA-Za-z _]*[ñA-Za-z][ñA-Za-z _]*$/;
  registerForm: FormGroup;
  matcher = new MyErrorStateMatcher();
  minDate: Date;
  maxDate: Date;

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
}

  constructor(private spinner: NgxSpinnerService, 
    private formBuilder: FormBuilder,
    private waveService: WaveServiceService,
    router: Router) {
      const currentYear = new Date().getFullYear();
      const currentDay = new Date().getDate();
      const currentMonth = new Date().getMonth();
      this.minDate = new Date(currentYear - 80, currentMonth, currentDay);
      this.maxDate = new Date(currentYear, currentMonth, currentDay);
      this.registerForm = this.formBuilder.group(
        {
          nombres: new FormControl('', [
            Validators.required, 
            Validators.pattern(this.onlyletters)]),
          apellidos: new FormControl('', [Validators.required, 
          Validators.pattern(this.onlyletters)]),
          fecha: new FormControl('', [Validators.required]),
          correo: new FormControl('', [
            Validators.required,
            Validators.pattern(this.emailPattern)
          ]),
          usuario: new FormControl('', [
            Validators.required
          ]),
          contra: new FormControl('', [
            Validators.required,
            Validators.minLength(7),
            Validators.maxLength(10),
            Validators.pattern(this.passwordPattern)
          ]),
          validContra: new FormControl('')
        },
        { validator: [this.checkPasswords] }
      );
     }
  
  files: File[] = [];

  ngOnInit(): void {
  }
  onResetForm() {
    this.registerForm.reset();
  }
  onSaveForm() {
    if (this.registerForm.valid) {
      
        this.spinner.show();
        console.log(this.registerForm.value)
        this.waveService
          .registerAdmin(
            this.registerForm.value.nombres,
            this.registerForm.value.apellidos,
            this.registerForm.value.usuario,
            this.registerForm.value.correo,
            this.registerForm.value.fecha,
            this.registerForm.value.contra
            
          )
          .subscribe((data) => {
            console.log(data);
            alert("Registrado con  exito");
            this.registerForm.reset(); 
            this.spinner.hide();
          },
          (error)=>{
            alert(error.error.message);
            this.spinner.hide();
          });
      }
    
    
  }
  checkPasswords(group: FormGroup) {
    let pass = group.controls.contra.value;
    let confirmPass = group.controls.validContra.value;

    return pass === confirmPass ? null : { notSame: true };
  }

  get nombres() {
    return this.registerForm.get('nombres');
  }

  get apellidos() {
    return this.registerForm.get('apellidos');
  }

  get fecha() {
    return this.registerForm.get('fecha');
  }

  get usuario() {
    return this.registerForm.get('usuario');
  }

  get correo() {
    return this.registerForm.get('correo');
  }

  get contra() {
    return this.registerForm.get('contra');
  }

  get validContra() {
    return this.registerForm.get('validContra');
  }

  onSelect(event) {
    console.log(event);
    this.files.push(...event.addedFiles);
  }

  onRemove(event) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

}
