import { Component, OnInit } from '@angular/core';
import { WaveServiceService } from 'src/app/services/wave-service.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-sub-categoria',
  templateUrl: './sub-categoria.component.html',
  styleUrls: ['./sub-categoria.component.scss'],
})
export class SubCategoriaComponent implements OnInit {
  subcategories: any[] = [];
  favoriteForums: any[] = [];
  subscribedForums: any[] = [];
  subcategory: any = {};
  subcategoryId: number;
  categoryId: number;
  filteredForums: Observable<string[]>;
  myControl = new FormControl();
  fileToUpload = null;
  imageUrl = null;
  file: any;
  favorite = true;
  CatWFavoriteSubcat: any[] = [];
  forums: any;
  forumForm: FormGroup;
  subcaregoryContent: any = {};
  currentPage: number = 1;
  nextPage: boolean = false;
  comment;
  previousUrl: string;
  forumActive: any[] = [];

  createFormGroup() {
    return new FormGroup({
      text: new FormControl('', [Validators.required]),
    });
  }

  handleFileInput(file: FileList) {
    console.log(file);
    this.fileToUpload = file.item(0);
    console.log(this.fileToUpload);

    var reader = new FileReader();
    reader.onloadend = (event: any) => {
      this.imageUrl = event.target.result;
    };
    reader.readAsDataURL(this.fileToUpload);
    console.log(reader.result);
  }
  reset() {
    this.comment = '';
  }

  onUpload() {
    this.waveService.uploadPicture(this.fileToUpload).subscribe((res) => {
      console.log(res);
    });
  }

  constructor(
    private waveService: WaveServiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.forumForm = this.createFormGroup();
  }

  ngOnInit(): void {
    this.subcategoryId = this.route.snapshot.params['id'];
    this.waveService
      .getSubCategoryById(this.subcategoryId)
      .subscribe((response) => {
        this.subcategory = response;
        console.log('content', this.subcategory);

        this.filteredForums = this.myControl.valueChanges.pipe(
          startWith(''),
          map((value) => this._filter(value))
        );

        this.waveService
          .getForumsBySubcategory(this.subcategoryId)
          .subscribe((response) => {
            this.favoriteForums = response.items;
            this.currentPage = parseInt(response.meta.currentPage);
            this.nextPage =
              this.currentPage !== parseInt(response.meta.totalPages);
            console.log('foro fav', this.favoriteForums);

            this.waveService
              .getFavoritesForums(this.subcategoryId)
              .subscribe((response) => {
                console.log('suscribes', response.forums);
                this.subscribedForums = response.forums;
                for(let forum of this.subscribedForums){
                  if(forum.isActive){
                    this.forumActive.push(forum);
                  }
                }
                this.waveService.getAllForums({}).subscribe((response) => {
                  this.forums = response.forums;

                  this.waveService
                    .getFavoriteSubCategories()
                    .subscribe((response) => {
                      this.CatWFavoriteSubcat = response.categories;
                      console.log('hola', this.CatWFavoriteSubcat);

                      //let aja: [] = response;
                      //let bool = this.CatWFavoriteSubcat.find(
                      //(id) => id.id == this.categoryId
                      //);
                      //console.log(bool);
                    });
                  //});
                  //});
                });
              });
          });
      });
      this.previousUrl = this.waveService.getPreviousUrl();
  }

  traerMasForos() {
    this.waveService
      .getForumsBySubcategory(this.subcategoryId, this.currentPage + 1)
      .subscribe((response) => {
        this.favoriteForums = this.favoriteForums.concat(response.items);
        this.currentPage = parseInt(response.meta.currentPage);
        this.nextPage = this.currentPage !== parseInt(response.meta.totalPages);
      });
  }

  crearForo(idSubcategory: number, title: string) {
    this.waveService
      .createForum(idSubcategory, title)
      .subscribe((response: any) => {
        if (response) {
          console.log('foro creado');
          this.waveService.likeForum(response.forum.id).subscribe((res) => {
            if (res) {
              console.log(res);
              this.router.navigate([`/picture-foro/${response.forum.id}`]);
            }
          });
        }
      });
  }

  onSaveForm() {
    this.crearForo(this.subcategoryId, this.forumForm.value.text);
  }

  likeForo(id: number) {
    this.waveService.likeForum(id).subscribe((res) => {
      if (res) {
        console.log(res);
        this.waveService
              .getFavoritesForums(this.subcategoryId)
              .subscribe((response) => {
                console.log('suscribes', response.forums);
                this.subscribedForums = response.forums;
        });
        alert('¡Ahora estás suscrito en el foro!');
      }
    });
  }

  dislikeForo(id: number) {
    this.waveService.dislikeForum(id).subscribe((res) => {
      if (res) {
        console.log(res);
        this.waveService
              .getFavoritesForums(this.subcategoryId)
              .subscribe((response) => {
                console.log('suscribes', response.forums);
                this.subscribedForums = response.forums;
        });
        alert('¡Ya no estás suscrito en el foro!');
      }
    });
  }

  agregarFavorito() {
    console.log(this.subcategoryId);
    this.waveService
      .saveFavoriteSubCategoria(this.subcategoryId)
      .subscribe((response) => console.log(response));
    this.waveService.getFavoriteSubCategories().subscribe((response) => {
      this.CatWFavoriteSubcat = response.categories;
      console.log('hola', this.CatWFavoriteSubcat);
      this.isFav(this.subcategoryId);
    });
    alert('¡Ahora estás suscrito en la subcategoría!');
  }

  isFav(id: number) {
    
    if (this.CatWFavoriteSubcat) {
      for (let entry of this.CatWFavoriteSubcat) {
        if (entry.id == this.subcategory.category.id) {
          for (let sub of entry.subCategories) {
            if (sub.id == id) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  isSuscribed(id: number){
    if(this.subscribedForums){
      for(let entry of this.subscribedForums){
        if(entry.id == id){
          return true;
        }
      }
    }return false;
  }

  get text() {
    return this.forumForm.get('text');
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.favoriteForums.filter((option) =>
      option.title.toLowerCase().includes(filterValue)
    );
  }
}
