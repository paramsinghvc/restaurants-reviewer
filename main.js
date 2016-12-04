import fetch from 'isomorphic-fetch';

class Util {
    static render(text, data) {
        // debugger;
        return text.replace(/{{\w+}}/g, (placeholder) => {
            let p = /(?!{{)[^{}]+/.exec(placeholder);
            if (placeholder === '{{rating}}') {
                return Rating.getInstance().render(data['rating']);
            }
            return (p && p.length > 0) ? data[p[0]] || '' : '';
        }).replace(/>[\t\s]*</g, '><');
    }
}
class Restaurants {

    constructor() {
        this.t = document.getElementById('res-template');
        this.detailsTemplate = document.getElementById('res-details-template');
        this.reviewTemplate = document.getElementById('review-template');

        this.detailsInfo = document.getElementById('details-info');
        this.reviewsHolder = document.getElementById('reviews-holder');
        this.listHolder = document.getElementById('r-list');
        this.detailsModal = document.getElementById('r-details');
        this.ratingStar = document.getElementById('rating-star');
        this.ratingForm = document.getElementById('rating-form');
    }

    static getInstance() {
        return new Restaurants();
    }

    fetchData() {
        return fetch('/restaurants.json').then(res => res.json());
    }

    renderRestaurants() {
        let markup = '',
            self = this;
        this.fetchData().then((res) => {
            markup = res.map(r => Util.render(self.t.innerHTML, r)).join('');
            self.listHolder.innerHTML += markup;
            self.attachLiEventListeners(res);
        })
    }

    attachLiEventListeners(payload) {
        let listItems = Array.prototype.slice.call(this.listHolder.querySelectorAll('li[role="listitem"]'));
        let self = this;
        listItems.map((l, i) => {
            l.addEventListener('click', (e) => {
                self.openDetailsModal(l, payload[i]);
            })
            l.addEventListener('keydown', e => {
                if (e.keyCode === 13) {
                    self.openDetailsModal(l, payload[i]);
                }
            })
        })
    }

    openDetailsModal(activeLi, data) {
        let self = this;
        let i = activeLi.querySelector('img');
        document.body.style.overflowY = 'hidden';
        self.restoreImage = self.animateImage(i);
        self.detailsModal.style.display = 'block';

        setTimeout(() => {
            self.detailsModal.focus();
            self.detailsModal.addEventListener('keydown', e => {
                console.log(e.keyCode);
                if (e.keyCode === 27) {
                    self.closeDetailsModal();
                }
            })
            self.detailsModal.querySelector('img#p-img').src = i.src;
            let a = self.detailsModal.querySelector('#arrow');
            a.style.transform = 'translateX(10px)';
            a.addEventListener('click', () => {
                self.closeDetailsModal();
            });

            self.detailsInfo.innerHTML = Util.render(self.detailsTemplate.innerHTML, data);

            data.reviews.map((review) => {
                self.reviewsHolder.innerHTML += Util.render(self.reviewTemplate.innerHTML, review);
            })

            let RatingObj = Rating.getInstance();
            this.ratingStar.innerHTML = RatingObj.render(0);
            RatingObj.addInteractivity(this.ratingStar);

            this.ratingForm.onsubmit = function(e) {
            	e.preventDefault();
            	alert('Review submitted successfully')
            	return false;
            }
        })
    }

    closeDetailsModal() {
        let self = this;
        document.body.style.overflowY = 'scroll';
        self.detailsModal.querySelector('#arrow').style.transform = 'translateX(-100px)';
        self.reviewsHolder.innerHTML = '';
        setTimeout(() => {
            self.detailsModal.querySelector('img#p-img').src = '';
            self.detailsModal.style.display = 'none';
            self.restoreImage();
        }, 100);
    }

    animateImage(img) {

        img.style.position = 'fixed';
        img.style.zIndex = 101;
        let bounds = img.getBoundingClientRect();
        let topOffset = bounds.top;

        img.style.transform = `translateY(${-topOffset + 80}px)`;
        let boundsFinal = img.getBoundingClientRect();
        let topOffsetFinal = boundsFinal.top;
        return function() {
            img.style.transform = `translateY(${topOffsetFinal - topOffset}px)`;
            img.style.zIndex = 1;
            // setTimeout(() => {
            img.style.position = 'static';
            // }, 100)
        }

    }
}


class Rating {
    static getInstance() {
        return new Rating();
    }

    constructor() {
        // this.ratingTemplate = document.getElementById('rating-template').innerHTML;
        this.rating = 0;
    }

    render(ratingNumber) {
        this.ratingTemplate = `<div class="rating-holder" role="list" aria-selected="${ratingNumber}" aria-label="${ratingNumber} of 5 stars" tabindex="0">`;
        let i = 5 - ratingNumber;
        while (ratingNumber > 0) {
            this.ratingTemplate += '<img src="/assets/star.png" role="presentation" />';
            ratingNumber--;
        }
        while (i > 0) {
            this.ratingTemplate += '<img src="/assets/star-empty.png" role="presentation" />';
            i--;
        }
        this.ratingTemplate += '</div>';

        return this.ratingTemplate;
    }

    addInteractivity(el) {
        let stars = Array.prototype.slice.call(el.getElementsByTagName('img'));
        let self = this;
        stars.map((star, i) => {
            star.addEventListener('click', e => {
                self.rating = i + 1;
                el.innerHTML = self.render(i + 1);
                self.addInteractivity(el);
            });
        })
    }

}

const r = Restaurants.getInstance();
r.renderRestaurants();
