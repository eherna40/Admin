import React, { Component, Fragment } from "react";
import IntlMessages from "Util/IntlMessages";
import { Row, Card, CardBody, CardTitle, Badge,Button, Jumbotron } from "reactstrap";

import { Colxx, Separator } from "Components/CustomBootstrap";
import BreadcrumbContainer from "Components/BreadcrumbContainer";
import ReactSiemaCarousel from "Components/ReactSiema/ReactSiemaCarousel";
import PerfectScrollbar from "react-perfect-scrollbar";
import { database  } from '../../../firebase/index'
import { NavLink } from "react-router-dom";
import styles from './styles.js'

export default class extends Component {

	state={
		users: '',
		shops: '',
		totalOfferts: '',
		offerts: [],
		categories: []
	}
	componentDidMount = () => {
		database.collection('CATEGORIES').get().then(categories =>{
			database.collection('OFFERTS').limit(8).get().then(offerts =>{
				this.setState({
					categories: categories.docs,
					offerts: offerts.docs
				})
			})
		})
		database.collection('USERS').get().then(res =>{
			this.setState({
				users: res.size.toString()
			})
		})
		database.collection('LOCALS').get().then(res =>{
			this.setState({
				shops: res.size.toString()
			})
		})
		database.collection('OFFERTS').get().then(res =>{
			
			this.setState({
				totalOfferts: res.size.toString(),
			})
		})
	}

	getIconCategory = (id) => {
		const category = this.state.categories.filter(item => item.id === id)
		return  category[0].data().icon
	}

	getNameShop = async(place_id) =>{
		return await database.collection('LOCALS').doc(place_id).get().then(res =>  res.data().name)
		 

	}
	render() {
		const { users, totalOfferts, shops, offerts } = this.state
		return (
			<Fragment>
				<Row>
					<Colxx xxs="12">
						<BreadcrumbContainer
							heading={<IntlMessages id="menu.start" />}
							match={this.props.match}
						/>
						<Separator className="mb-5" />
					</Colxx>
				</Row>
				<Row>
					<Colxx lg="12" xl="6">
						<div className="icon-cards-row">
							<ReactSiemaCarousel
								perPage={{
									0: 1,
									320: 2,
									576: 3,
									1800: 4
								}}
								controls={false}
								loop={false}
							>
								<div className="icon-row-item">
									<Card className="mb-4">
										<CardBody className="text-center">
											<i className="iconsmind-Male" />
											<p className="card-text font-weight-semibold mb-0">
												Usuarios
											</p>
											<p className="lead text-center">{ users }</p>
										</CardBody>
									</Card>
								</div>
								<div className="icon-row-item">
									<Card className="mb-4">
										<CardBody className="text-center">
											<i className="iconsmind-Shop" />
											<p className="card-text font-weight-semibold mb-0">
												Bares
											</p>
											<p className="lead text-center">{ shops }</p>
										</CardBody>
									</Card>
								</div>
								<div className="icon-row-item">
									<Card className="mb-4">
										<CardBody className="text-center">
											<i className="iconsmind-Basket-Coins" />
											<p className="card-text font-weight-semibold mb-0">
												Ofertas
											</p>
											<p className="lead text-center">{ totalOfferts }</p>
										</CardBody>
									</Card>
								</div>

							</ReactSiemaCarousel>
						</div>
					</Colxx>
					<Colxx lg="12" xl="6" className="mb-4">
						<Card>
							<div className="position-absolute card-top-buttons">
								<button className="btn btn-header-light icon-button">
									<i className="simple-icon-refresh" />
								</button>
							</div>
							<CardBody>
								<CardTitle>
									Ofertas creadas recientemente
								</CardTitle>
								<div className="scroll dashboard-list-with-thumbs">
									<PerfectScrollbar
										option={{ suppressScrollX: true, wheelPropagation: false }}
									>
										{offerts.map((offert, index) => {
											return (
												<div key={index} className="d-flex flex-row mb-3">
												
													<NavLink
														to="/app/layouts/details"
														className="d-block position-relative"
													>
														<img
															src={this.getIconCategory(offert.data().category)}
															className="list-thumbnail border-0"
														/> 
														<Badge
															key={index}
															className="position-absolute badge-top-right"
															color='blue'
															pill
															style={{
																background: offert.data().active ? styles.active : styles.inactive,
																color: styles.white
															}}
														>
															{
																offert.data().active ? 'Active' : 'Inactivo'
															}
														</Badge>
													</NavLink>

													<div className="pl-3 pt-2 pr-2 pb-2">
														 <NavLink to="/app/layouts/details">
															<p className="list-item-heading">{offert.data().title}</p>
															<div className="pr-4">
																<p className="text-muted mb-1 text-small">
																	
																</p>
															</div>
															<div className="text-primary text-small font-weight-medium d-none d-sm-block">
																{offert.data().price}€
															</div>
														</NavLink>
													</div>
												</div>
											);
										})}
									</PerfectScrollbar>
								</div>
							</CardBody>
						</Card>
					</Colxx>

				</Row>
			</Fragment>
		);
	}
}
