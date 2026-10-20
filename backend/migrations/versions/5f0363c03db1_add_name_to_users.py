
from alembic import op
import sqlalchemy as sa

revision = "add_user_name"
down_revision = "ffedf4d0783f"
branch_labels = None
depends_on = None


def upgrade():
    # Add the column temporarily as nullable for existing users.
    op.add_column(
        "users",
        sa.Column("name", sa.String(150), nullable=True)
    )

    # Give existing accounts a temporary name based on their email.
    op.execute("""
        UPDATE users
        SET name = split_part(email, '@', 1)
    """)

    # Require a name for all users going forward.
    op.alter_column(
        "users",
        "name",
        existing_type=sa.String(150),
        nullable=False
    )


def downgrade():
    op.drop_column("users", "name")
