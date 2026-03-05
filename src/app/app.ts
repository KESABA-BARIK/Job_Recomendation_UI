import { Component , ChangeDetectorRef} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {

  skillInput = '';
  skills: string[] = [];
  result: any = null;
  loading = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  addSkill(skill?: string) {
    const skillToAdd = skill ? skill : this.skillInput;
  const cleanSkill = skillToAdd.trim().toLowerCase();

  if (cleanSkill && !this.skills.includes(cleanSkill)) {
    this.skills.push(cleanSkill);
  }

  // only clear input if we added from the text field
  if (!skill) {
    this.skillInput = '';
  }
  }

  removeSkill(skill: string) {
    this.skills = this.skills.filter(s => s !== skill);
  }

  predict() {
  if (this.skills.length === 0) return;

  console.log("Sending skills:", this.skills);

  this.loading = true;
  this.result = null;

  this.http.post<any>(
    'https://job-recomendation-uc67.onrender.com/recommend',
    { skills: this.skills }
  ).subscribe({
    next: (res) => {
      console.log("Backend response:", res);

      // Use recommended_job if it exists, else fallback to raw response
      this.result = res.recommended_job;

      console.log("Assigned result:", this.result);
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Recommend API error:", err);
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

onFileSelected(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('resume', file);

  this.http.post<any>(
    'https://job-recomendation-uc67.onrender.com/upload-resume',
    formData
  ).subscribe({
    next: res => {
      console.log('Resume extracted skills:', res.skills);

      if (res.skills && res.skills.length) {
        // automatically "click Add" for each extracted skill
        res.skills.forEach((skill: string) => this.addSkill(skill));
      }
      console.log('Updated skills list:', this.skills);
      this.cdr.detectChanges();
    },
    error: err => console.error('Resume upload failed', err)
  });
}


}