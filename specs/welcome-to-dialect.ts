import { html } from 'common-tags'

import { defineEmailSpec } from '~/utils/spec.js'

const welcomeToDialectEmailSpec = defineEmailSpec({
	slug: 'welcome-to-dialect',
	subject: 'Welcome to Dialect!',
	text: 'Welcome to Dialect',
	data: null,
	html: html`
		<!DOCTYPE html>
		<html>
			<div
				style="
					padding: 40px;
					font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial,
						'Luci da Grande', sans-serif;
					background-color: rgb(249, 249, 249);
				"
			>
				<div style="max-width: 620px; margin-left: auto; margin-right: auto">
					<div
						style="
							text-align: center;
							font-weight: bold;
							font-size: 30px;
							margin-bottom: 20px;
						"
					>
						Dialect
					</div>
					<div
						style="border-radius: 5px; background-color: white; padding: 40px"
						class="card"
					>
						<table class="table">
							<tr>
								<td style="padding: 5px">
									<div style="color: rgb(100, 100, 100); line-height: 25px">
										Welcome to Dialect!
									</div>
								</td>
							</tr>
							<tr>
								<td style="padding: 5px">
									<div
										style="
											height: 2px;
											width: 100%;
											background-color: rgb(230, 230, 230);
											margin-top: 20px;
											margin-bottom: 20px;
										"
									></div>
								</td>
							</tr>
							<tr>
								<td style="padding: 5px">
									<div
										style="
											font-size: 13px;
											color: rgb(100, 100, 100);
											text-align: center;
										"
									>
										Need help? Send an email to
										<a style="color: darkorange" href="mailto:hello@dialect.so">
											hello@dialect.so
										</a>
										to get in touch with our team.
									</div>
								</td>
							</tr>
						</table>
					</div>
				</div>
			</div>
		</html>
	`
})
export default welcomeToDialectEmailSpec